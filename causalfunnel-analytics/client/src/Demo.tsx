import { ArrowLeft, ArrowRight, Check, Heart, Leaf, Package, ShieldCheck, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Demo() {
  useEffect(() => {
    const script = document.createElement('script');
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    script.src = `${apiBase}/tracker.js`;
    script.dataset.endpoint = `${apiBase}/api/events`;
    script.defer = true;
    document.body.appendChild(script);
    return () => { script.remove(); };
  }, []);
  const [added, setAdded] = useState<string[]>([]);
  const products = [
    { id: 'daily', name: 'Daily Ritual Set', category: 'THE EVERYDAY EDIT', price: '₹1,290', color: 'sand', mark: '01' },
    { id: 'serum', name: 'Calm + Restore Serum', category: 'SKIN ESSENTIALS', price: '₹890', color: 'sage', mark: '02' },
    { id: 'bottle', name: 'Refillable Travel Bottle', category: 'LOW-WASTE LIVING', price: '₹490', color: 'blue', mark: '03' }
  ];
  const add = (id: string) => setAdded(old => old.includes(id) ? old : [...old, id]);
  return <div className="storefront">
    <div className="store-announcement"><Sparkles size={13}/> A little more thoughtful, every day <span>Complimentary delivery over ₹999</span></div>
    <header className="store-header"><a className="store-logo" href="/demo">kindred<span>.</span></a><nav><a href="#collection">Shop</a><a href="#story">Our approach</a><a href="#footer">Contact</a></nav><div className="store-actions"><span>IN / ₹</span><button aria-label="Shopping bag"><ShoppingBag size={19}/><b>{added.length}</b></button></div></header>
    <main><section className="store-hero"><div className="hero-copy"><span className="eyebrow"><Leaf size={13}/> SMALL CHOICES, BETTER RITUALS</span><h1>Good things,<br/><em>made simpler.</em></h1><p>Considered essentials for everyday living. Thoughtfully made, easy to love, and designed to stay in your routine.</p><a href="#collection" className="store-cta">Explore the edit <ArrowRight size={16}/></a><div className="hero-proof"><span><Check size={13}/> Thoughtfully sourced</span><span><Check size={13}/> Everyday essentials</span></div></div><div className="hero-art" aria-label="Abstract product display"><div className="art-sun"/><div className="art-card card-back"><span>KINDRED / Nº 01</span><div className="bottle-shape bottle-one"/><small>daily ritual</small></div><div className="art-card card-front"><span>LESS, BUT BETTER</span><div className="bottle-shape bottle-two"/><small>calm + restore</small></div><div className="art-leaf leaf-one"/><div className="art-leaf leaf-two"/></div></section>
    <section className="trust-strip"><div><ShieldCheck size={17}/><span>Made with intention</span></div><div><Package size={17}/><span>Less packaging, more purpose</span></div><div><Heart size={17}/><span>Everyday-friendly essentials</span></div></section>
    <section id="collection" className="collection"><div className="collection-head"><div><span className="eyebrow">THE KINDRED EDIT</span><h2>Little things, <em>well chosen.</em></h2></div><span>01 — 03 / OUR PICKS</span></div><div className="product-grid">{products.map(p => <article className="product-card" key={p.id}><button className={`product-visual ${p.color}`} aria-label={`View ${p.name}`}><span className="product-mark">{p.mark}</span><div className={`product-object object-${p.id}`}>{p.id === 'daily' ? <><div/><div/></> : p.id === 'serum' ? <><div/><span>k.</span></> : <><div/><span>REFILL</span></>}</div><span className="quick-view">Quick view <ArrowRight size={13}/></span></button><div className="product-info"><div><small>{p.category}</small><h3>{p.name}</h3></div><strong>{p.price}</strong></div><button className={`add-button ${added.includes(p.id) ? 'is-added' : ''}`} onClick={() => add(p.id)}>{added.includes(p.id) ? <><Check size={15}/> Added to bag</> : <>Add to bag <ArrowRight size={15}/></>}</button></article>)}</div></section>
    <section id="story" className="story"><div className="story-symbol"><Leaf size={28}/><span>k.</span></div><div><span className="eyebrow">A NOTE FROM KINDRED</span><h2>Buy a little better.<br/><em>Use it a little longer.</em></h2><p>We believe the best products earn their place in your day. Start with a few useful things, keep what works, and let the small rituals add up.</p></div><div className="story-rating"><div><Star size={15} fill="currentColor"/><Star size={15} fill="currentColor"/><Star size={15} fill="currentColor"/><Star size={15} fill="currentColor"/><Star size={15} fill="currentColor"/></div><strong>Good things, thoughtfully chosen.</strong><span>Our simple promise</span></div></section>
    </main><footer id="footer" className="store-footer"><a className="store-logo" href="/demo">kindred<span>.</span></a><span>Everyday essentials, with a little more intention.</span><a href="/">Back to analytics <ArrowLeft size={14}/></a></footer>
    <div className="demo-banner"><span><span className="status-dot green"/> Analytics tracker active</span><span>Try clicking products, buttons, and navigation. <a href="/">View dashboard <ArrowRight size={13}/></a></span></div>
  </div>;
}
