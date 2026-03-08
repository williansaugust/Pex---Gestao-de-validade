import React, { useState, useEffect } from 'react';
import { db, initializationError, auth, onAuthStateChanged, User } from './firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import { Product, SaleRecord } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Firebase Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      setIsChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    if (!db) {
      setDbError(initializationError || "O Firebase não foi inicializado corretamente. Verifique sua conexão e as credenciais no arquivo .env.local.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDbError(null);
    console.log("Iniciando listeners do Firestore...");

    try {
      // 1. Inventory Listener
      const inventoryQuery = query(collection(db, "inventory"));
      const unsubscribeInventory = onSnapshot(inventoryQuery, (snapshot) => {
        const loadedProducts = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            ...data,
            id: docSnapshot.id
          } as Product;
        });
        setProducts(loadedProducts);
        setIsLoading(false);
      }, (error) => {
        console.error("Erro no listener do inventário:", error);
        setDbError(`Erro no Inventário: ${error.message}`);
        setIsLoading(false);
      });

      // 2. Sales Listener
      const salesQuery = query(collection(db, "sales"), orderBy("saleDate", "desc"));
      const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
        const loadedSales = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as SaleRecord[];
        setSalesHistory(loadedSales);
      }, (error) => {
        console.error("Erro no listener de vendas:", error);
        setDbError(`Erro nas Vendas: ${error.message}`);
      });

      return () => {
        unsubscribeInventory();
        unsubscribeSales();
      };
    } catch (e) {
      console.error("Falha ao configurar listeners:", e);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  if (isChecking) return null;

  if (initializationError) {
    return (
      <div className="min-h-screen bg-[#200000] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-white text-xl font-bold mb-4 uppercase tracking-tight">Erro Crítico de Inicialização</h2>
          <p className="text-red-200/70 text-sm mb-6 leading-relaxed">
            {initializationError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-200 text-xs font-bold tracking-widest uppercase transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAuthenticated ? (
        <LoginModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard
          products={products}
          salesHistory={salesHistory}
          isLoading={isLoading}
          dbError={dbError}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default App;