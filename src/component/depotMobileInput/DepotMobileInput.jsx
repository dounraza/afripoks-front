import { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { depot as depotService } from "../../services/depotMobileService";
import { getEnvoie as compte } from "../../services/envoieService";

import "react-phone-number-input/style.css";
import "./DepotMobileInput.scss"
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DepotMobileInput = () => {
    const [pseudo, setPseudo] = useState(sessionStorage.getItem('userName'));
    const [amount, setAmount] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [name, setName] = useState("");
    const [ref, setRef] = useState("");
    const navigate = useNavigate();
    const [compteEnvoie,setCompteEnvoie] = useState();

    const getCompte = async () => {
        await compte(setCompteEnvoie);
    }

    const cancelTransac = () => {
        setAmount(0);
        setPhoneNumber("");
        setRef(""); 
        setName(""); 
        navigate("/table");
    }

    const isValid = (pseudo,amount,phoneNumber,name,ref) => {
        if(pseudo !== '' && amount !== '' && phoneNumber !== '' && name !== '' && ref !== '' ){
            if(amount <= 0) {
                return false;
            }

            return true;
        }else{
            return false;
        }
    }

    const saveTransac = async () => {
        const valid = isValid(pseudo,amount,phoneNumber,name,ref);
        if(valid){
            const data = {
                pseudo: pseudo,
                montant: amount,
                numero: phoneNumber,
                nom: name,
                reference: ref
            };
            try {
                await depotService(data);
                setTimeout(() => {
                    navigate('/table');
                }, 2000);
            } catch (error) {
                toast.error(error.message);
            }
            
        }else{
            toast.error('veullez remplir tous les champs correctement!')
        }       
    }

    useEffect(() => {
        getCompte();
    },[])

    return(
        <div className="form-content">
            {Array.isArray(compteEnvoie) &&
                compteEnvoie.map((c) => (
                    <>
                        <div className="num-owner">Nom du propriétaire : <b>{c.nom}</b></div>
                        <div className="num-owner">Numéro du propriétaire : (<b>{c.telephone}</b>)</div>
                    </>                
            ))}
            

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
                        placeholder="Entrez votre numéro"
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
            <div className="input-group">
                <div className="label">Référence</div>
                <div className="input">
                    <input 
                        type="text"
                        value={ref}
                        onChange={(e) => setRef(e.target.value)} 
                    />
                </div>
            </div> 
            <div className="submit">
                <div className="cancel" onClick={() => {cancelTransac()}}>Annuler</div>
                <div className="submit" onClick={() => {saveTransac()}}>Déposer</div>
            </div> 
        </div>  
    );
}

export default DepotMobileInput;