import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import { retrait as retraitService } from "../../services/RetraitMobileService";

import "react-phone-number-input/style.css";
import "./RetraitMobileInput.scss"
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { isUserInTable } from "../../services/tableServices";

const RetraitMobileInput = () => {
    const [pseudo, setPseudo] = useState(sessionStorage.getItem('userName'));
    const [amount, setAmount] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const cancelTransac = () => {
        setAmount(0);
        setPhoneNumber(""); 
        setName(""); 
        navigate("/table");
    }

    const saveTransac = async () => {
        const valid = isValid(pseudo,amount,phoneNumber,name);
        if(valid){
            const data = {
                pseudo: pseudo,
                montant: amount,
                numero: phoneNumber,
                nom: name
            }
            try {
                const userId = sessionStorage.getItem('userId');
                const userInTable = await isUserInTable(userId);
                
                if (userInTable) {
                  toast.error("Vous devez d'abord quitter la table.");
                  return;
                }
                
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

    function isValid(pseudo,amount,phone,name){
        if(pseudo !== '' && amount !== '' && phone !== '' && name !== ''){
            if(amount<=0) {
                return false
            }
            return true;
        }else{
            return false;
        }
    }

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
                <div className="label">Montant</div>
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
                <div className="label">Numéro de téléphone</div>
                <div className="input">
                    <PhoneInput
                        defaultCountry="MG"
                        placeholder="Entrez votre numéro de téléphone"
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                    />
                </div>
            </div>  
            <div className="input-group">
                <div className="label">Nom du joueur</div>
                <div className="input">
                    <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)} 
                    />
                </div>
            </div>    
            <div className="submit">
                <div className="cancel" onClick={() => {cancelTransac()}}>Annuler</div>
                <div className="submit" onClick={() => {saveTransac()}}>Retirer</div>
            </div> 
        </div>  
    );
}

export default RetraitMobileInput;