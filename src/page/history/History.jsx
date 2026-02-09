import { useEffect, useState } from "react";
import Nav from "../../component/nav/Nav";
import { findAll as findDepotCrypto } from "../../services/depotCryptoService";
import { findAll as findDepotMobile } from "../../services/depotMobileService";
import { findAll as findRetraitCrypto } from "../../services/RetraitCryptoService";
import { findAll as findRetraitMobile } from "../../services/RetraitMobileService";

import "./History.scss";

const History = () => {

    const pseudo = sessionStorage.getItem("userName");
    const [transactions, setTransactions] = useState([]);

    const getTransaction = async () => {
        const depotCrypto = (await findDepotCrypto(pseudo)).map(t => ({ ...t, type: 'Dépot Crypto' }));
        const depotMobile = (await findDepotMobile(pseudo)).map(t => ({ ...t, type: 'Dépot Mobile' }));
        const retraitCrypto = (await findRetraitCrypto(pseudo)).map(t => ({ ...t, type: 'Retrait Crypto' }));
        const retraitMobile = (await findRetraitMobile(pseudo)).map(t => ({ ...t, type: 'Retrait Mobile' }));

        const allTransactions = [
            ...depotCrypto,
            ...depotMobile,
            ...retraitCrypto,
            ...retraitMobile
        ];

        const sortedTransactions = allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log(sortedTransactions);       
        setTransactions(sortedTransactions);
    };

    useEffect(() => {
        getTransaction();
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { month: "short" };
        return {
            month: date.toLocaleString("fr-FR", options),
            day: String(date.getDate()).padStart(2, '0'),
        };
    };
    
    return (
        <>
            <Nav />
            <div className="history-container">
                <div className="history-content">
                    {transactions.map((tx, i) => {
                        const { month, day } = formatDate(tx.createdAt);
                        return (
                            <div className="content" key={i}>
                                <div className="date">
                                    <div className="month">{month}</div>
                                    <div className="day">{day}</div>
                                </div>
                                <div className="info">
                                    <div className="type">{tx.type}</div>
                                    <div className="ref">{tx.reference || tx.adressePortefeuille || '—'}</div>
                                </div>
                                <div className="status">
                                    {tx.etat === true ? 'Validé' : 'En cours'}
                                </div>
                            </div>
                        );
                    })}
                    {transactions.length === 0 && <p style={{ color : "white" }}>No transactions made.</p>}
                </div>
            </div>
        </>
        
    );
};

export default History;