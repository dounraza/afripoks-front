import Tracking from "../../component/tracking/Tracking";
import Nav from "../../component/nav/Nav";
import RetraitMobileInput from "../../component/retraitMobileInput/RetraitMobileInput";
import RetraitCryptoInput from "../../component/retraitCryptoInput/RetraitCryptoInput";

import "./Retrait.scss";
import { ToastContainer } from "react-toastify";

const Retrait = () => {
    return (
        <>
            <ToastContainer />
            <Nav />
            <div className="depot-container">
                
                <div className="depot-content">
                    <div className="title">Retrait</div>
                    <Tracking>
                        <div className="form-container">
                            <RetraitMobileInput />     
                        </div>
                        <div className="form-container cm">
                            <RetraitCryptoInput />
                        </div>
                    </Tracking>
                </div>    
            </div>
        </>
        
    );
};

export default Retrait;