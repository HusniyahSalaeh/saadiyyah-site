"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, BookOpen, GraduationCap, FileText, Search, Filter, X, Plus, Minus, BadgeCheck, Globe, CreditCard, Download } from "lucide-react";

const SITE = {
  brand: "Saadiyyah Institute",
  tagline: "แหล่งรวมใบงาน คอร์สออนไลน์ และหนังสือการ์ตูนเพื่อการเรียนรู้สนุก ๆ",
  highlight: "เปิดตัว! ชุดใบงานใหม่ประจำเทอม",
  social: { facebook: "#", line: "#", youtube: "#" },
  payment: { howTo: "โอนผ่าน PromptPay แล้วแนบสลิป หรือสั่งผ่าน LINE", checkoutLink: "#" },
};

type ItemType = "worksheet" | "course" | "comic";
type CatalogItem = {
  id: string; type: ItemType; title: string; price: number; tags: string[];
  desc: string; thumb: string; downloadSample?: string; digital?: boolean; physical?: boolean; bestseller?: boolean; new?: boolean;
};

const CATALOG: CatalogItem[] = [
  { id: "wks-001", type: "worksheet", title: "ใบงานคณิต ป.3 ชุดที่ 1", price: 79, tags: ["คณิต","ป.3"], desc: "แบบฝึกหัดพร้อมเฉลย PDF", thumb: "https://images.unsplash.com/photo-1584697964154-3f71e66b4a7a?w=600&auto=format&fit=crop&q=60", digital: true, bestseller: true },
  { id: "crs-101", type: "course", title: "วาดการ์ตูนตั้งแต่ 0", price: 1290, tags: ["การ์ตูน","ผู้เริ่มต้น"], desc: "คอร์สวิดีโอ + กลุ่มถามตอบ", thumb: "https://images.unsplash.com/photo-1544551763-7ef42006926f?w=600&auto=format&fit=crop&q=60", digital: true },
  { id: "cmc-201", type: "comic", title: "วิทย์มันส์ซ่า ภาคทดลองในครัว", price: 179, tags: ["วิทยาศาสตร์"], desc: "คอมิกความรู้เหมาะกับทุกวัย", thumb: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=60", digital: true }
];

const currency = (n: number) => n.toLocaleString("th-TH", { style: "currency", currency: "THB" });

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial as T;
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState] as const;
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"worksheet" | "course" | "comic" | "all">("all");
  const [sort, setSort] = useState<"popular" | "new" | "price_asc" | "price_desc">("popular");
  const [onlyDigital, setOnlyDigital] = useState(false);
  const [cart, setCart] = useLocalStorage<{ id: string; qty: number }[]>("cart", []);
  const [active, setActive] = useState<CatalogItem | null>(null);

  const filtered = useMemo(() => {
    let items = CATALOG.slice();
    if (type !== "all") items = items.filter(i => i.type === type);
    if (onlyDigital) items = items.filter(i => i.digital);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        i.desc.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "new": items = items.sort((a,b)=>(b.new?1:0)-(a.new?1:0)); break;
      case "price_asc": items = items.sort((a,b)=>a.price-b.price); break;
      case "price_desc": items = items.sort((a,b)=>b.price-a.price); break;
      default: items = items.sort((a,b)=>(b.bestseller?1:0)-(a.bestseller?1:0));
    }
    return items;
  }, [query, type, sort, onlyDigital]);

  const total = useMemo(() => cart.reduce((sum, c) => {
    const item = CATALOG.find(i => i.id === c.id); return sum + (item ? item.price * c.qty : 0);
  }, 0), [cart]);

  const addToCart = (id: string, qty = 1) => setCart(prev => {
    const f = prev.find(p => p.id === id);
    return f ? prev.map(p => p.id === id ? { ...p, qty: p.qty + qty } : p) : [...prev, { id, qty }];
  });
  const removeFromCart = (id: string) => setCart(prev => prev.filter(p => p.id !== id));
  const setQty = (id: string, qty: number) => setCart(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, qty) } : p));
  const clearCart = () => setCart([]);

  return (
    <div>
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b">
        <div className="container py-3 flex items-center gap-3">
          <div className="font-bold">{SITE.brand}</div>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <a className="hover:underline" href={SITE.social.facebook}>Facebook</a>
            <a className="hover:underline" href={SITE.social.line}>LINE</a>
            <a className="hover:underline" href={SITE.social.youtube}>YouTube</a>
            <button className="btn" onClick={() => document.getElementById("cart-drawer")?.classList.remove("hidden")}>
              <ShoppingCart className="h-4 w-4 mr-2" /> ตะกร้า ({cart.reduce((a,b)=>a+b.qty,0)})
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-10 md:py-14">
        <motion.h1 className="text-3xl md:text-5xl font-bold" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          สร้างการเรียนรู้ให้สนุก ด้วยสื่อพร้อมใช้
        </motion.h1>
        <p className="text-slate-600 mt-3 md:text-lg">{SITE.tagline}</p>
      </section>

      {/* Controls + Catalog */}
      <section id="catalog" className="border-t bg-white/60">
        <div className="container py-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="ค้นหา" value={query} onChange={e=>setQuery(e.target.value)} />
            </div>
            <select className="input w-[160px]" value={type} onChange={e=>setType(e.target.value as any)}>
              <option value="all">ทั้งหมด</option><option value="worksheet">ใบงาน</option><option value="course">คอร์ส</option><option value="comic">การ์ตูน</option>
            </select>
            <select className="input w-[160px]" value={sort} onChange={e=>setSort(e.target.value as any)}>
              <option value="popular">ยอดนิยม</option><option value="new">มาใหม่</option><option value="price_asc">ราคาต่ำ-สูง</option><option value="price_desc">ราคาสูง-ต่ำ</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border">
              <Filter className="h-4 w-4 text-slate-500" /><span className="text-sm">เฉพาะดิจิทัล</span>
              <input type="checkbox" className="h-4 w-4" checked={onlyDigital} onChange={e=>setOnlyDigital(e.target.checked)} />
            </label>
          </div>

          <div className="grid-catalog mt-6">
            {filtered.map(item => (
              <div key={item.id} className="card p-4">
                <div className="text-lg font-semibold">{item.title}</div>
                <div className="text-sm text-slate-600">{item.desc}</div>
                <div className="mt-3 text-xl font-bold">{currency(item.price)}</div>
                <div className="mt-3 flex gap-2">
                  <button className="btn btn-primary" onClick={()=>addToCart(item.id)}><ShoppingCart className="h-4 w-4 mr-2" />เพิ่มลงตะกร้า</button>
                  <button className="btn" onClick={()=>setActive(item)}>รายละเอียด</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 border-t text-center text-sm text-slate-500">© {new Date().getFullYear()} {SITE.brand}</footer>

      {/* Drawer Cart */}
      <div id="cart-drawer" className="hidden fixed inset-0">
        <div className="modal-backdrop" onClick={() => document.getElementById("cart-drawer")?.classList.add("hidden")}></div>
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">ตะกร้าสินค้า</div>
            <button className="btn" onClick={() => document.getElementById("cart-drawer")?.classList.add("hidden")}><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 space-y-3 flex-1 overflow-auto">
            {cart.length===0 && <div className="text-sm text-slate-500">ยังไม่มีสินค้า</div>}
            {cart.map(c => {
              const item = CATALOG.find(i=>i.id===c.id)!;
              return (
                <div key={c.id} className="flex items-center gap-3 border rounded-xl p-3">
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-500">{currency(item.price)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button className="btn" onClick={()=>setQty(c.id, c.qty-1)}><Minus className="h-4 w-4" /></button>
                      <div className="w-9 text-center">{c.qty}</div>
                      <button className="btn" onClick={()=>setQty(c.id, c.qty+1)}><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <button className="btn" onClick={()=>removeFromCart(c.id)}><X className="h-4 w-4" /></button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between text-sm"><span>รวม</span><span className="font-semibold">{currency(total)}</span></div>
            <div className="text-xs text-slate-500 mt-2">{SITE.payment.howTo}</div>
            <div className="flex gap-2 mt-4">
              <a className="btn btn-primary w-full" href={SITE.payment.checkoutLink}><CreditCard className="h-4 w-4 mr-2" /> ชำระเงิน/กรอกข้อมูล</a>
              <button className="btn" onClick={clearCart}>ล้างตะกร้า</button>
            </div>
          </div>
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-50">
          <div className="modal-backdrop" onClick={()=>setActive(null)}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl border shadow-xl w-[90vw] max-w-2xl p-4">
            <div className="text-lg font-semibold">{active.title}</div>
            <div className="text-sm text-slate-600 mt-2">{active.desc}</div>
            <div className="mt-3 text-2xl font-bold">{currency(active.price)}</div>
            <div className="mt-4 text-right"><button className="btn" onClick={()=>setActive(null)}>ปิด</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
