import { useEffect, useState } from "react";

import "./RetraitCryptoInput.scss"
import { retrait as retraitService } from "../../services/RetraitCryptoService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getType as typeService } from "../../services/typeService";

const RetraitCryptoInput = () => {
    const [pseudo, setPseudo] = useState(sessionStorage.getItem('userName'));
    const [amount, setAmount] = useState(0);
    const [walletAddress, setWalletAddress] = useState("");
    const [selectedCrypto, setSelectedCrypto] = useState(1);
    const [name, setName] = useState("");
    const [type,setType] = useState();
    const navigate = useNavigate();


    const cancelTransac = () => {
        setAmount(0);
        setWalletAddress("");
        navigate("/table"); 
    }

    const getType = async () => {
        await typeService(setType);
    }

    const saveTransac = async () => {
        const valid = isValid(pseudo,amount,walletAddress,name,selectedCrypto);
        if(valid){
            const data = {
                pseudo: pseudo,
                montant: amount,
                adressePortefeuille: walletAddress,
                nom: name,
                typeCryptoMoneyId: selectedCrypto
            }
            try {
                await retraitService(data);
                setTimeout(() => {
                    navigate('/table');
                }, 1000);
            } catch (error) {
                toast.error(error.message);    
            }
        }else{
            toast.error('veuillez remplir tous les champs correctement!');
        }
    }

    function isValid(pseudo,amount,selectedCrypto,name,typeCryptoMoneyId){
        if(pseudo !== '' && amount !== '' && selectedCrypto !== '' && name !== '' && typeCryptoMoneyId !== ''){
            // if(amount<=0) {
            //     return false
            // }
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
                <div className="label">Wallet Address</div>
                <div className="input">
                    <input 
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                    />
                </div>
            </div>   
            <div className="input-group">
                <div className="label">Type of crypto</div>
                <div className="input">
                    <select value={selectedCrypto} onChange={(e) => setSelectedCrypto(e.target.value)}>
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
            <div className="input-group">
                <div className="label">Player Name</div>
                <div className="input">
                    <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>
            <div className="submit">
                <div className="cancel" onClick={() => {cancelTransac()}}>Cancel</div>
                <div className="submit" onClick={() => {saveTransac()}}>Withdraw</div>
            </div> 
        </div>  
    );
}

export default RetraitCryptoInput;