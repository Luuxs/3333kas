const { useState, useEffect, useRef } = React;

// --- BASE DE DATOS SIMULADA ---
const INVENTORY = [
    { 
        id: 1, 
        name: "OVERSOULED HOODIE", 
        price: 120.00, 
        img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80", 
        sizes: ["S", "M", "L", "XL"] 
    },
    { 
        id: 2, 
        name: "BLOOD MOON TEE", 
        price: 65.00, 
        img: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=500&q=80", 
        sizes: ["M", "L"] 
    },
    { 
        id: 3, 
        name: "NO FUTURE BEANIE", 
        price: 35.00, 
        img: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=500&q=80", 
        sizes: ["UNICA"] 
    },
    { 
        id: 4, 
        name: "VENOM LIPSTICK", 
        price: 45.00, 
        img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=500&q=80", 
        sizes: ["UNICA"] 
    }
];

// ====== COMPONENTE: El elemento que vuela (+1) ======
function FlyingItem({ item }) {
    const [position, setPosition] = useState({ x: item.startX, y: item.startY, opacity: 1, scale: 1 });

    useEffect(() => {
        // Retraso minúsculo para que el navegador dibuje el punto de inicio antes de moverlo
        const timer = setTimeout(() => {
            setPosition({ x: item.endX, y: item.endY, opacity: 0.2, scale: 0.3 });
        }, 50);
        
        return () => clearTimeout(timer);
    }, [item]);

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                transform: `translate(-50%, -50%) scale(${position.scale})`,
                opacity: position.opacity,
                transition: 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)', // 1.2 segundos de vuelo visible
                zIndex: 9999, 
                pointerEvents: 'none'
            }}
            className="text-accent font-black font-mono text-4xl drop-shadow-[0_0_10px_rgba(255,0,60,0.8)]"
        >
            +1
        </div>
    );
}

function App() {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    
    // Referencia y estado para la animación de vuelo
    const cartBtnRef = useRef(null);
    const [flyingItems, setFlyingItems] = useState([]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const addToCart = (product, selectedSize, event) => {
        if (!selectedSize) {
            alert("Por favor selecciona una talla.");
            return;
        }

        // --- LÓGICA DE LA ANIMACIÓN DE VUELO ---
        if (event && cartBtnRef.current) {
            const btnRect = event.target.getBoundingClientRect(); // Donde hice clic
            const cartRect = cartBtnRef.current.getBoundingClientRect(); // Dónde está el carrito

            const newFlyingItem = {
                id: Date.now() + Math.random(),
                startX: btnRect.left + btnRect.width / 2,
                startY: btnRect.top + btnRect.height / 2,
                endX: cartRect.left + cartRect.width / 2,
                endY: cartRect.top + cartRect.height / 2
            };

            setFlyingItems(prev => [...prev, newFlyingItem]);

            // Eliminar el elemento volador después de 1200ms (lo que dura el vuelo)
            setTimeout(() => {
                setFlyingItems(prev => prev.filter(item => item.id !== newFlyingItem.id));
            }, 1200);
        }

        // --- LÓGICA DE AGREGAR AL ESTADO DEL CARRITO ---
        const existingItem = cart.find(item => item.id === product.id && item.size === selectedSize);
        
        if (existingItem) {
            setCart(cart.map(item => 
                (item.id === product.id && item.size === selectedSize) 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ));
        } else {
            setCart([...cart, { ...product, size: selectedSize, quantity: 1 }]);
        }
    };

    const removeFromCart = (id, size) => {
        setCart(cart.filter(item => !(item.id === id && item.size === size)));
    };

    const updateQuantity = (id, size, change) => {
        setCart(cart.map(item => {
            if (item.id === id && item.size === size) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        if (cart.length === 0) return;

        let text = "🦇 *NUEVO PEDIDO DESDE LA WEB* 🦇\n\n";
        cart.forEach(item => {
            text += `- ${item.name}\n  Talla: ${item.size} | Cantidad: ${item.quantity}\n  Subtotal: S/ ${item.price * item.quantity}\n\n`;
        });
        text += `*TOTAL A PAGAR: S/ ${totalAmount}.00*\n\n`;
        text += "Confirmo mi pedido. Quedo atento(a) para realizar el Yape/Plin.";

        const waNumber = "51979724863"; // Reemplaza con tu número
        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
    };

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Renderizamos los elementos voladores */}
            {flyingItems.map(item => (
                <FlyingItem key={item.id} item={item} />
            ))}

            {/* NAVBAR */}
            <header className="flex flex-col items-center p-4 md:p-6 border-b border-gray-800 bg-dark sticky top-0 z-40 shadow-md">
                <div className="w-full flex justify-between items-center mb-4 md:mb-6">
                    <div className="hidden md:block w-24"></div> 
                    
                    <button 
                        onClick={scrollToTop}
                        className="text-4xl md:text-5xl font-gothic tracking-widest text-center focus:outline-none transition-transform active:scale-95"
                    >
                        3333<span className="text-accent">KAS</span>
                    </button>
                    
                    {/* Botón CARRITO */}
                    <button 
                        ref={cartBtnRef}
                        onClick={() => setIsCartOpen(true)}
                        className="font-mono text-xs md:text-sm tracking-widest hover:text-accent transition-all duration-300 transform hover:scale-105 active:scale-90 w-auto md:w-24 text-right"
                    >
                        CARRITO ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </button>
                </div>

                <nav className="w-full flex overflow-x-auto justify-start md:justify-center space-x-6 md:space-x-8 text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-300 whitespace-nowrap no-scrollbar pb-2 md:pb-0">
                    <a href="#" className="hover:text-accent transition-colors">NUEVO</a>
                    <a href="#" className="hover:text-accent transition-colors">ROPA</a>
                    <a href="#" className="hover:text-accent transition-colors">MAQUILLAJE</a>
                    <a href="#" className="hover:text-accent transition-colors">ACCESORIOS</a>
                    <a href="#" className="hover:text-accent transition-colors">OFERTAS</a>
                </nav>
            </header>

            {/* PRODUCT GRID */}
            <main className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {INVENTORY.map(product => (
                        <ProductCard key={product.id} product={product} onAdd={addToCart} />
                    ))}
                </div>
            </main>

            {/* FOOTER CON INSTAGRAM */}
            <footer className="border-t border-gray-800 bg-dark py-8 flex flex-col items-center justify-center pb-20 md:pb-8 mt-4">
                <a 
                    href="https://www.instagram.com/3333kas/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2 transition-transform transform hover:scale-110 focus:outline-none"
                >
                    <div className="text-gray-500 group-hover:text-accent transition-colors">
                        {/* Ícono más pequeño: w-7 h-7 en celular y w-8 h-8 en PC */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                    </div>
                    {/* Texto más pequeño: text-xs */}
                    <span className="font-mono text-xs tracking-widest text-gray-400 group-hover:text-white transition-colors">
                        @3333kas
                    </span>
                </a>
            </footer>

            {/* ====== CART SIDEBAR (ANIMACIÓN SLIDE Y FADE) ====== */}
            <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-500 ${isCartOpen ? 'visible' : 'invisible'}`}>
                <div 
                    className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} 
                    onClick={() => setIsCartOpen(false)}
                ></div>
                
                <div className={`relative w-full max-w-md bg-dark border-l border-gray-800 h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                        <h2 className="font-bold text-xl tracking-widest">TU CARRITO</h2>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-accent transition-colors text-3xl leading-none transform hover:rotate-90 duration-300">&times;</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <p className="text-gray-500 font-mono text-sm text-center mt-10">Tu carrito está tan vacío como tu alma.</p>
                        ) : (
                            cart.map((item, index) => (
                                <div key={index} className="flex gap-4 border border-gray-800 p-4 relative group">
                                    <button 
                                        onClick={() => removeFromCart(item.id, item.size)}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-accent text-lg leading-none transition-colors"
                                    >&times;</button>
                                    <img src={item.img} alt={item.name} className="w-20 h-24 object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    
                                    <div className="flex flex-col justify-between w-full pr-4">
                                        <div>
                                            <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                                            <p className="text-gray-400 font-mono text-xs mt-1">Talla: {item.size}</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-3">
                                            <p className="font-mono text-sm text-accent">S/ {item.price}</p>
                                            
                                            <div className="flex items-center border border-gray-700">
                                                <button onClick={() => updateQuantity(item.id, item.size, -1)} className="px-2 py-0.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">-</button>
                                                <span className="px-3 font-mono text-sm">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.size, 1)} className="px-2 py-0.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-800 bg-dark">
                        <div className="flex justify-between items-center mb-6 font-bold text-xl">
                            <span>TOTAL</span>
                            <span>S/ {totalAmount}.00</span>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className="w-full bg-white text-black py-4 font-bold tracking-widest transition-all duration-300 transform active:scale-95 hover:bg-accent hover:text-white hover:shadow-[0_0_20px_rgba(255,0,60,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                            COMPRAR POR WHATSAPP
                        </button>
                        <p className="text-center text-gray-500 font-mono text-xs mt-4">
                            * El pago se coordina manualmente vía Yape/Plin.
                        </p>
                    </div>
                </div>
            </div>

            {/* BOTÓN FLOTANTE "IR ARRIBA" */}
            {showScrollTop && (
                <button 
                    onClick={scrollToTop}
                    className="md:hidden fixed bottom-6 right-6 bg-accent text-white p-3 rounded-full shadow-[0_0_15px_rgba(255,0,60,0.4)] z-40 transition-transform transform hover:scale-110 active:scale-90 focus:outline-none flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ====== TARJETA DE PRODUCTO ======
function ProductCard({ product, onAdd }) {
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddClick = (e) => {
        if (!selectedSize) return;
        onAdd(product, selectedSize, e); 
        
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 1200); // El botón se queda rojo el mismo tiempo que dura el vuelo (1.2s)
    };

    return (
        <div className="group border border-gray-800 p-4 transition-all duration-500 hover:border-gray-500 flex flex-col h-full">
            <div className="relative overflow-hidden mb-4 bg-gray-900 aspect-[3/4]">
                <img 
                    src={product.img} 
                    alt={product.name} 
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
                />
            </div>
            
            <div className="flex justify-between items-start mb-4 flex-grow">
                <h3 className="font-bold text-lg leading-tight w-2/3">{product.name}</h3>
                <span className="font-mono text-accent whitespace-nowrap ml-2">S/ {product.price}</span>
            </div>

            <div className="space-y-4 mt-auto">
                <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                        <button 
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1 font-mono text-xs border transition-colors duration-300 ${
                                selectedSize === size 
                                ? 'border-white bg-white text-black' 
                                : 'border-gray-700 text-gray-400 hover:border-gray-400'
                            }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={handleAddClick}
                    className={`w-full border py-3 font-mono text-sm tracking-widest transition-all duration-300 transform active:scale-95 ${
                        isAdded 
                        ? 'bg-accent border-accent text-white shadow-[0_0_20px_rgba(255,0,60,0.5)]' 
                        : 'border-gray-700 text-gray-300 hover:bg-white hover:text-black hover:border-white'
                    }`}
                >
                    {isAdded ? '✚ AGREGADO' : 'AGREGAR AL CARRITO'}
                </button>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);