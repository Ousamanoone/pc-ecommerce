import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import {
  Cpu,
  Layers,
  Zap,
  HardDrive,
  Monitor,
  Box,
  Wind,
  Plus,
  Trash2,
  Share2,
  Printer,
  ShoppingBag,
  Check,
  RotateCcw,
  Search,
  X,
  AlertCircle,
  Package,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface BuilderCategory {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
}

const BUILDER_CATEGORIES: BuilderCategory[] = [
  { key: 'CPU', label: 'Processor (CPU)', icon: Cpu, required: true },
  { key: 'Cooling', label: 'CPU Cooler', icon: Wind, required: false },
  { key: 'Mainboard', label: 'Motherboard', icon: Layers, required: true },
  { key: 'RAM', label: 'Memory (RAM)', icon: Layers, required: true },
  { key: 'Storage', label: 'Primary SSD / Storage', icon: HardDrive, required: true },
  { key: 'GPU', label: 'Graphics Card (GPU)', icon: Monitor, required: false },
  { key: 'PSU', label: 'Power Supply Unit (PSU)', icon: Zap, required: true },
  { key: 'Case', label: 'Chassis / Case', icon: Box, required: true },
  { key: 'Monitor', label: 'Display Monitor', icon: Monitor, required: false },
];

interface CompatibilityReport {
  isCompatible: boolean;
  issues: {
    type: 'error' | 'warning';
    title: string;
    details: string;
  }[];
}

export const PCBuilderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart() as any;
  const navigate = useNavigate();

  const [selectedParts, setSelectedParts] = useState<{ [category: string]: Product | null }>({});
  const [activeCategory, setActiveCategory] = useState<BuilderCategory | null>(null);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);
  const [modalSearch, setModalSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Restore build from shared query parameters
  useEffect(() => {
    const loadSharedConfig = async () => {
      const keys = BUILDER_CATEGORIES.map((c) => c.key);
      const partsToLoad: { [category: string]: Product } = {};

      for (const cat of keys) {
        const slug = searchParams.get(cat.toLowerCase());
        if (slug) {
          try {
            const res = await api.get(`/products/${slug}`);
            if (res.data) {
              partsToLoad[cat] = res.data;
            }
          } catch (err) {
            console.warn(`Failed to resolve component for ${cat}:`, slug);
          }
        }
      }

      if (Object.keys(partsToLoad).length > 0) {
        setSelectedParts(partsToLoad);
        showToast('Restored hardware build from shared configuration link.');
      }
    };

    loadSharedConfig();
  }, []);

  const openCategoryModal = async (category: BuilderCategory) => {
    setActiveCategory(category);
    setModalSearch('');
    setLoadingModal(true);
    try {
      const res = await api.get('/products', {
        params: { category: category.key, limit: 50 },
      });
      setModalProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load category inventory:', err);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    if (!activeCategory) return;
    setSelectedParts((prev) => ({
      ...prev,
      [activeCategory.key]: product,
    }));
    setActiveCategory(null);
  };

  const handleRemovePart = (categoryKey: string) => {
    setSelectedParts((prev) => {
      const updated = { ...prev };
      delete updated[categoryKey];
      return updated;
    });
  };

  const handleClearBuild = () => {
    setSelectedParts({});
    setSearchParams({});
    showToast('Reset build configuration.');
  };

  // Metrics: Cost & Wattage Load
  const { totalPrice, totalWattage, recommendedPSU, chosenCount } = useMemo(() => {
    let price = 0;
    let wattage = 0;
    let count = 0;

    Object.values(selectedParts).forEach((part) => {
      if (part) {
        count++;
        price += part.discountPrice || part.price;
        wattage += part.wattage || 0;
      }
    });

    const recommended = wattage > 0 ? Math.ceil((wattage * 1.35) / 50) * 50 : 0;
    return {
      totalPrice: price,
      totalWattage: wattage,
      recommendedPSU: recommended,
      chosenCount: count,
    };
  }, [selectedParts]);

  // Compatibility Engine
  const compatibility = useMemo<CompatibilityReport>(() => {
    const issues: CompatibilityReport['issues'] = [];
    const cpu = selectedParts['CPU'];
    const mb = selectedParts['Mainboard'];
    const ram = selectedParts['RAM'];
    const psu = selectedParts['PSU'];

    // 1. Socket Verification (CPU vs Motherboard)
    if (cpu && mb) {
      const detectSocket = (name: string) => {
        const lower = name.toLowerCase();
        if (/lga\s?1700|12th|13th|14th/i.test(lower)) return 'LGA1700';
        if (/lga\s?1200|10th|11th/i.test(lower)) return 'LGA1200';
        if (/am5|ryzen\s?[789]000/i.test(lower)) return 'AM5';
        if (/am4|ryzen\s?[1-5]000/i.test(lower)) return 'AM4';
        if (cpu.brand === 'Intel' && mb.brand === 'AMD') return 'MISMATCH';
        return null;
      };

      const cpuSocket = detectSocket(cpu.name);
      const mbSocket = detectSocket(mb.name);

      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        issues.push({
          type: 'error',
          title: 'Physical Socket Incompatibility',
          details: `Processor (${cpu.name}) uses socket ${cpuSocket}, while Motherboard (${mb.name}) features socket ${mbSocket}. They cannot be physically mounted together.`,
        });
      }
    }

    // 2. Memory Standard Verification (Motherboard vs RAM)
    if (mb && ram) {
      const isDDR5_MB = /ddr5/i.test(mb.name);
      const isDDR4_MB = /ddr4/i.test(mb.name);
      const isDDR5_RAM = /ddr5/i.test(ram.name);
      const isDDR4_RAM = /ddr4/i.test(ram.name);

      if (isDDR5_MB && isDDR4_RAM) {
        issues.push({
          type: 'error',
          title: 'RAM Generation Mismatch',
          details: `The selected motherboard requires DDR5 memory, but DDR4 RAM is currently chosen.`,
        });
      } else if (isDDR4_MB && isDDR5_RAM) {
        issues.push({
          type: 'error',
          title: 'RAM Generation Mismatch',
          details: `The selected motherboard operates on DDR4 memory slots, but DDR5 RAM is selected.`,
        });
      }
    }

    // 3. Power Headroom Verification (PSU Wattage vs Estimated Load)
    if (psu && totalWattage > 0) {
      const psuWattageMatch = psu.name.match(/(\d{3,4})\s?w/i);
      const psuCapacity = psuWattageMatch ? parseInt(psuWattageMatch[1], 10) : psu.wattage || 0;

      if (psuCapacity > 0 && psuCapacity < recommendedPSU) {
        issues.push({
          type: 'warning',
          title: 'Insufficient Power Supply Headroom',
          details: `The selected PSU is rated for ~${psuCapacity}W, while system peak transient load requires at least ${recommendedPSU}W for stable operation.`,
        });
      }
    }

    return {
      isCompatible: !issues.some((i) => i.type === 'error'),
      issues,
    };
  }, [selectedParts, totalWattage, recommendedPSU]);

  // Share Configuration Link
  const handleShareLink = () => {
    const params = new URLSearchParams();
    Object.entries(selectedParts).forEach(([catKey, product]) => {
      if (product?.slug) {
        params.set(catKey.toLowerCase(), product.slug);
      }
    });

    const shareUrl = `${window.location.origin}/builder?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    setSearchParams(params);
    showToast('Copied shareable configuration link to clipboard!');
  };

  // Add all items to cart
  const handleAddAllToCart = () => {
    const partsList = Object.values(selectedParts).filter(Boolean) as Product[];
    if (partsList.length === 0) {
      showToast('Select components before checkout.');
      return;
    }

    partsList.forEach((part) => {
      if (typeof addToCart === 'function') {
        addToCart(part, 1);
      }
    });

    showToast(`Added ${partsList.length} components to shopping cart.`);
    navigate('/cart');
  };

  const filteredModalProducts = modalProducts.filter((p) =>
    p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 py-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50 print:hidden">
          <div className="alert alert-success shadow-xl rounded-2xl text-xs font-bold text-white">
            <Check className="w-4 h-4" /> {toastMessage}
          </div>
        </div>
      )}

      {/* ==================== WEB DISPLAY (PRINT: HIDDEN) ==================== */}
      <div className="print:hidden space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
          <div>
            <span className="badge badge-primary badge-sm font-bold uppercase text-[10px] mb-1">
              Custom PC Configurator
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
              Rig Builder & Compatibility Estimator
            </h1>
            <p className="text-xs text-base-content/60 mt-0.5">
              Configure matching components, verify socket compatibility, and generate quotations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleClearBuild}
              disabled={chosenCount === 0}
              className="btn btn-ghost btn-sm rounded-xl text-xs font-bold gap-1 text-base-content/60 hover:text-error"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={handleShareLink}
              disabled={chosenCount === 0}
              className="btn btn-ghost btn-sm rounded-xl text-xs font-bold gap-1 border border-base-content/15"
            >
              <Share2 className="w-3.5 h-3.5 text-primary" /> Share Link
            </button>
            <button
              onClick={() => window.print()}
              disabled={chosenCount === 0}
              className="btn btn-ghost btn-sm rounded-xl text-xs font-bold gap-1 border border-base-content/15"
            >
              <Printer className="w-3.5 h-3.5 text-primary" /> Print Quotation
            </button>
            <button
              onClick={handleAddAllToCart}
              disabled={chosenCount === 0 || !compatibility.isCompatible}
              className="btn btn-primary btn-sm rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
            >
              <ShoppingBag className="w-4 h-4" /> Add All to Cart
            </button>
          </div>
        </div>

        {/* Realtime Compatibility Banner */}
        {chosenCount > 1 && (
          <div>
            {compatibility.isCompatible && compatibility.issues.length === 0 ? (
              <div className="p-3.5 bg-success/10 border border-success/20 rounded-2xl flex items-center gap-3 text-xs text-success font-bold">
                <ShieldCheck className="w-5 h-5 shrink-0 text-success" />
                <span>Compatibility Check Passed: All selected components are electrically and physically compatible.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {compatibility.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
                      issue.type === 'error'
                        ? 'bg-error/10 border-error/25 text-error'
                        : 'bg-warning/10 border-warning/25 text-warning-content'
                    }`}
                  >
                    {issue.type === 'error' ? (
                      <AlertCircle className="w-5 h-5 shrink-0 text-error mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0 text-warning mt-0.5" />
                    )}
                    <div>
                      <span className="font-black block uppercase text-[11px]">{issue.title}</span>
                      <p className="mt-0.5 leading-relaxed opacity-90">{issue.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-base-200 border border-base-content/10 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-base-content/50 uppercase block">Selected Parts</span>
              <span className="text-xl font-black text-base-content font-mono">
                {chosenCount} / {BUILDER_CATEGORIES.length} Items
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-base-200 border border-base-content/10 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-base-content/50 uppercase block">Estimated Power Load</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-warning font-mono">~{totalWattage} W</span>
                {recommendedPSU > 0 && (
                  <span className="text-[10px] text-base-content/60 font-semibold">
                    (Rec. {recommendedPSU}W PSU)
                  </span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-base-200 border border-base-content/10 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-base-content/50 uppercase block">Total Configuration Cost</span>
              <span className="text-2xl font-black text-primary font-mono">${totalPrice}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Hardware Slot Rows */}
        <div className="bg-base-200/50 border border-base-content/10 rounded-3xl overflow-hidden divide-y divide-base-content/5">
          {BUILDER_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const product = selectedParts[category.key];

            return (
              <div
                key={category.key}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base-200/80 transition-colors"
              >
                {/* Category Identity */}
                <div className="flex items-center gap-3 sm:w-1/4 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-base-100 border border-base-content/10 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-base-content block">
                        {category.label}
                      </span>
                      {category.required && (
                        <span className="text-error font-black text-xs" title="Recommended component">*</span>
                      )}
                    </div>
                    <span className="text-[10px] text-base-content/40 uppercase font-mono">
                      {category.key}
                    </span>
                  </div>
                </div>

                {/* Selected Product Details */}
                <div className="flex-1 min-w-0">
                  {product ? (
                    <div className="flex items-center gap-3 bg-base-100 p-2.5 rounded-2xl border border-base-content/5">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded-lg bg-base-200/50 shrink-0 p-1"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-base-content truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-base-content/50 uppercase font-semibold">
                            {product.brand}
                          </span>
                          {product.wattage !== undefined && product.wattage > 0 && (
                            <span className="text-[10px] font-mono text-warning font-bold">
                              ⚡ {product.wattage}W
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 px-2">
                        <span className="font-mono font-black text-sm text-primary block">
                          ${product.discountPrice || product.price}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-base-content/40 italic py-2 pl-1">
                      No {category.label} selected yet.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  {product ? (
                    <>
                      <button
                        onClick={() => openCategoryModal(category)}
                        className="btn btn-ghost btn-xs rounded-xl text-[11px] font-bold border border-base-content/10 hover:border-primary"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => handleRemovePart(category.key)}
                        className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                        title="Remove component"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openCategoryModal(category)}
                      className="btn btn-primary btn-xs rounded-xl text-xs font-bold gap-1 px-3 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Select {category.key}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== A4 PRINT TEMPLATE ==================== */}
      <div className="hidden print:block font-sans text-black p-4 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-wider uppercase">GEARSTORE HARDWARE</h1>
            <p className="text-xs text-neutral-600">High-Performance Workstation Configurator</p>
            <p className="text-[10px] text-neutral-500 mt-1">Website: gearstore.local | Hotline: 1800-GEAR</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase tracking-tight">Official Quotation</h2>
            <p className="text-xs font-mono mt-0.5">REF: GS-BUILD-{Date.now().toString().slice(-6)}</p>
            <p className="text-xs text-neutral-600">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-[11px] uppercase tracking-wider bg-neutral-100">
              <th className="py-2 px-2 font-bold w-12">#</th>
              <th className="py-2 px-2 font-bold w-28">Category</th>
              <th className="py-2 px-2 font-bold">Hardware Component</th>
              <th className="py-2 px-2 font-bold w-20 text-center">Power</th>
              <th className="py-2 px-2 font-bold w-16 text-center">Qty</th>
              <th className="py-2 px-2 font-bold w-24 text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300">
            {BUILDER_CATEGORIES.map((category, index) => {
              const product = selectedParts[category.key];
              if (!product) return null;

              return (
                <tr key={category.key} className="align-middle">
                  <td className="py-2 px-2 font-mono">{index + 1}</td>
                  <td className="py-2 px-2 font-bold text-neutral-700">{category.label}</td>
                  <td className="py-2 px-2 font-semibold">
                    {product.name}
                    <span className="block text-[10px] font-normal text-neutral-500">
                      Brand: {product.brand} | Standard 36-Month Warranty
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center font-mono">
                    {product.wattage ? `${product.wattage}W` : '-'}
                  </td>
                  <td className="py-2 px-2 text-center font-mono">1</td>
                  <td className="py-2 px-2 text-right font-mono font-bold">
                    ${product.discountPrice || product.price}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-start border-t-2 border-black pt-4">
          <div className="space-y-1 text-[11px] text-neutral-600 max-w-sm">
            <p className="font-bold text-black">Terms & Technical Notes:</p>
            <p>1. Quotation pricing is guaranteed for 14 calendar days from creation date.</p>
            <p>2. Hardware power load is estimated at ~{totalWattage}W. Recommended minimum PSU: {recommendedPSU}W.</p>
            <p>3. Comprehensive bench testing and BIOS optimization included with complete rigs.</p>
          </div>

          <div className="w-64 space-y-1 text-right text-xs">
            <div className="flex justify-between py-0.5">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">${totalPrice}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Assembly & Testing:</span>
              <span className="text-green-700 font-bold">FREE</span>
            </div>
            <div className="flex justify-between py-1 border-t border-black text-sm font-black">
              <span>Grand Total:</span>
              <span className="font-mono">${totalPrice} USD</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 pt-12 text-center text-xs">
          <div>
            <p className="font-bold">Customer Signature</p>
            <p className="text-[10px] text-neutral-400 mt-10">(Sign & Date)</p>
          </div>
          <div>
            <p className="font-bold">Technical Consultant</p>
            <p className="text-[10px] text-neutral-400 mt-10">GEARSTORE Authorized Rep.</p>
          </div>
        </div>
      </div>

      {/* ==================== SELECTION MODAL ==================== */}
      {activeCategory && (
        <div className="modal modal-open z-50 print:hidden">
          <div className="modal-box max-w-3xl rounded-3xl bg-base-200 border border-base-content/10 p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase block">Component Selector</span>
                <h3 className="text-lg font-black text-base-content">
                  Choose {activeCategory.label}
                </h3>
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder={`Search ${activeCategory.key} models, brands...`}
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-100"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingModal ? (
                <div className="py-12 text-center">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
              ) : filteredModalProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-base-content/50 space-y-1">
                  <AlertCircle className="w-8 h-8 text-base-content/30 mx-auto" />
                  <p className="font-bold">No hardware components found matching query</p>
                </div>
              ) : (
                filteredModalProducts.map((product) => {
                  const isSelected = selectedParts[activeCategory.key]?._id === product._id;
                  const price = product.discountPrice || product.price;

                  return (
                    <div
                      key={product._id}
                      className={`p-3 bg-base-100 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected ? 'border-primary shadow-sm' : 'border-base-content/5 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-12 h-12 object-contain p-1 rounded-lg bg-base-200/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-base-content truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="badge badge-primary badge-xs font-bold text-[9px] uppercase">
                              {product.brand}
                            </span>
                            {product.wattage !== undefined && product.wattage > 0 && (
                              <span className="text-[10px] font-mono text-warning font-semibold">
                                ⚡ {product.wattage}W
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-semibold ${
                                product.stock > 0 ? 'text-success' : 'text-error'
                              }`}
                            >
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-black text-sm text-primary">
                          ${price}
                        </span>
                        <button
                          onClick={() => handleSelectProduct(product)}
                          disabled={product.stock <= 0}
                          className={`btn btn-xs rounded-xl font-bold px-3 ${
                            isSelected ? 'btn-success text-white' : 'btn-primary'
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : 'Choose'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCBuilderPage;