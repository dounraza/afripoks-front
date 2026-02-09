import { useState } from "react";
import { register as registerService } from "../../services/registerService";
import { User, Key, Eye, EyeOff } from "lucide-react";
import "./register.scss";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import pokerBackground from '../../image/bg.jpg'; 
import logo from '../../styles/image/logo.jpeg';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [isOver18, setIsOver18] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const validateEmail = (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        };

        const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!isOver18) {
            toast.error("Please confirm that you are over 18 years old");
            setIsLoading(false);
            return;
        }

        // Validations côté client
        if (!formData.email || !formData.password || !confirm || !formData.name) {
            toast.error("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (!validateEmail(formData.email)) {
            toast.error("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        if (formData.password !== confirm) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must contain at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            const result = await registerService(formData);
            
            if (result?.success) {
                toast.success("Registration successful! You will be redirected to the login page.");
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (error) {
            console.error("Erreur non gérée:", error);
        } finally {
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
                        <img src={logo} alt="Logo AFRIPOKS" className="logo-chip" />
                        <h1>AFRIPOKS</h1>
                    </div>
                    <p className="welcome-text">Créez votre compte pour jouer</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <div className="input-icon">
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            name="email"
                            placeholder="Adresse e-mail"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <div className="input-icon">
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Pseudo"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            minLength={3}
                        />
                    </div>

                    <div className="input-group">
                        <div className="input-icon">
                            <Key size={20} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Mot de passe (6 characters minimum)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                        <button 
                            type="button" 
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="input-group">
                        <div className="input-icon">
                            <Key size={20} />
                        </div>
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirmer le mot de passe"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            minLength={6}
                        />
                        <button 
                            type="button" 
                            className="toggle-password"
                            onClick={() => setShowConfirm(!showConfirm)}
                            aria-label={showConfirm ? "Masquer la confirmation" : "Afficher la confirmation"}
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="age-confirmation">
                        <label className="toggle-container">
                            <input 
                                type="checkbox" 
                                checked={isOver18}
                                onChange={() => setIsOver18(!isOver18)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                        <span className="age-text">Je confirme avoir plus de 18 ans</span>
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : (
                            "S'inscrire"
                        )}
                    </button>
                </form>

                <div className="register-link">
                    Vous avez déjà un compte ? <a href="/login">Se connecter</a>
                </div>
            </div>
        </div>
    );
};

export default Register;