import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Depot from "./page/depot/Depot";
import Retrait from "./page/retrait/Retrait";
import Login from "./page/login/Login";
import PageLogin from "./page/loginAdmin/Login";
import Tables from './page/table/Tables';
import History from './page/history/History';
import GameTable from './page/game/GameTable';
import Register from './page/register/Register';

import './App.scss';
import Transaction from './page/admin/transaction/Transaction';
import Compte from './page/admin/compte/Compte';
import Historique from './page/admin/historique/Historique';
import Type from './page/admin/typeCrypto/Type';
import Acceuil from './page/acceuil/Acceuil';
import SoldePlayers from './page/admin/soldeplayers/SoldePlayers';
import Dashboard from './component/dashboard/Dashboard';
import HistoriqueMain from "./page/admin/historiquemain/HistoriqueMain";

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/table" element={<Tables />} />
          <Route path="/" element={<Acceuil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<PageLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/history" element={<History />} />
          <Route path="/depot" element={<Depot />} />
          <Route path="/retrait" element={<Retrait />} />
          <Route path="/game/:tableid" element={<GameTable />} />
          <Route path="/game/:tableid/:tableSessionIdShared" element={<GameTable />} />

          {/* admin  */}
          <Route path="/" element={<Dashboard />}>
            <Route path="transactions" element={<Transaction />} />
            <Route path="comptes-envoi" element={<Compte />} />
            <Route path="type-crypto" element={<Type />} />
            <Route path="transactions-historique" element={<Historique />} />
            <Route path="soldes-users" element={<SoldePlayers />} />
            <Route path="histo-main" element={<HistoriqueMain />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;