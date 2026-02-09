import Tracking from "../../component/tracking/Tracking";
import Nav from "../../component/nav/Nav";
import DepotMobileInput from "../../component/depotMobileInput/DepotMobileInput";
import DepotCryptoInput from "../../component/depotCryptoInput/DepotCryptoInput";

import "./Depot.scss";
import { ToastContainer } from "react-toastify";

const Depot = () => {
    return (
        <>
            <ToastContainer />
            <Nav />
            <div className="depot-container">
                
                <div className="depot-content">
                    <div className="title">Deposit</div>
                    <Tracking>
                        <div className="form-container">
                            <DepotMobileInput />     
                        </div>
                        <div className="form-container">
                            <DepotCryptoInput />
                        </div>
                    </Tracking>
                </div>    
            </div>
        </>
        
    );
};

export default Depot;