import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getType as typeService } from "../../services/typeService";
import { depot as cryptoService } from "../../services/depotCryptoService";

import "./DepotCryptoInput.scss"
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DepotCryptoInput = () => {
    const [pseudo, setPseudo] = useState(sessionStorage.getItem('userName'));
    const [amount, setAmount] = useState(0);
    const [ref, setRef] = useState("");
    const [selectedCrypto, setSelectedCrypto] = useState();
    const [selectedCodeCrypto, setSelectedCodeCrypto] = useState();
    const [type,setType] = useState();
    const navigate = useNavigate();

    const cancelTransac = () => {
        setAmount(0);
        setRef(""); 
        navigate("/table");
    }

    const getType = async () => {
        await typeService(setType);
    }

    const saveTransac = async () => {
        const valid = isValid(pseudo,amount,ref,selectedCrypto);
        if(valid){
            const data = {
                pseudo: pseudo,
                montant: amount,
                reference: ref,
                typeCryptoMoneyId: selectedCrypto
            }
            try {
                await cryptoService(data);
                setTimeout(() => {
                    navigate('/table');
                }, 2000);
            } catch (error) {
                toast.error(error.message);
            }          
        }else{
            toast.error('veuillez remplir tous les champs correctement!');
        }
        
    }

    function isValid(pseudo,montant,idTransaction,type){
        if(pseudo !== '' && montant !== '' && idTransaction !== '' && type !== ''){
            if(amount <= 0) {
                return false;
            }

            return true;
        }else{
            return false;
        }
    }

    useEffect(() => {
        getType();
    },[])

    return(
        <div className="form-content">
            <div className="input-group">
                <div className="label">Pseudo</div>
                <div className="input">
                    <input 
                        type="text"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        disabled
                    />
                </div>
            </div>    
            <div className="input-group">
                <div className="label">Amount</div>
                <div className="input">
                    <input 
                        type="number" 
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </div>  
            <div className="input-group">
                <div className="label">Transaction ID</div>
                <div className="input">
                    <input 
                        type="text"
                        value={ref}
                        onChange={(e) => setRef(e.target.value)} 
                    />
                </div>
            </div> 
            <div className="input-group">
                <div className="label">Type of crypto</div>
                <div className="input">
                    <select value={selectedCrypto} onChange={(e) => {
                        const selectedId = e.target.value;
                        console.log(selectedId)
                        setSelectedCrypto(selectedId);

                        const selected = type.find((t) => t.id === Number(selectedId));
                        console.log(selected)
                        if (selected) {
                        setSelectedCodeCrypto(selected.adresse);
                        }
                    }}>
                        <option value="">Select the type of crypto</option>
                        {Array.isArray(type) &&
                            type.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                        {/* <option value="btc">Bitcoin</option>
                        <option value="eth">Ethereum</option>
                        <option value="dot">Polkadot</option>
                        <option value="trx">Tron</option>
                        <option value="usdt">Tether</option> */}
                    </select>
                </div>
            </div> 
            <div className="owner-wallet-address">
                {selectedCodeCrypto}
                <QRCodeCanvas value={selectedCodeCrypto} size={150} />
            </div>
            <div className="submit">
                <div className="cancel" onClick={() => {cancelTransac()}}>Cancel</div>
                <div className="submit" onClick={() => {saveTransac()}}>Deposit</div>
            </div> 
        </div>  
    );
}

export default DepotCryptoInput;