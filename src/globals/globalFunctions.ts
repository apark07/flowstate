import { auth } from '../../FirebaseConfig.ts';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

export const handleLogout = () => {
    auth.signOut();
    navigate('/');
};
