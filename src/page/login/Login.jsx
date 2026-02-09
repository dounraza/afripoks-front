import { useState } from "react";
import { login as authService } from "../../services/authService";
import { User, Key, Eye, EyeOff } from "lucide-react";
import "./Login.scss";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import pokerBackground from '../../image/bg.jpg'; 
import logo from '../../styles/image/logo.jpeg';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        try {
            const success = await authService(formData.email, formData.password);
            if (success) {
                setTimeout(() => navigate('/table'), 1500);
            } else {
                toast.error("Incorrect email or password");
                setIsLoading(false);
            }
        } catch (error) {
            toast.error("An error has occurred");
            setIsLoading(false);
        } 
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(${pokerBackground})` }}>
            <div className="overlay"></div>
            <ToastContainer />
            
            <div className="login-card">
                <div className="card-header">
                    <div className="logo-container">
                        <img src={logo} alt="Poker Chip" className="logo-chip" />
                        <h1>AFRIPOKS</h1>
                    </div>
                    <p className="welcome-text">Connectez-vous pour jouer</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <div className="input-icon">
                            <User size={20} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Adresse e-mail"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <div className="input-icon">
                            <Key size={20} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button 
                            type="button" 
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                <div className="register-link">
                    Nouveau membre ? <a href="/register">Créer un compte</a>
                </div>
            </div>
        </div>
    );
};

export default Login;