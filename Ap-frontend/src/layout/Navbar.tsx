import { NavLink } from 'react-router-dom';
import { Home, Image as ImageIcon } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="navbar glass-effect">
            <ul className="nav-links">
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <Home size={20} />
                        <span>Inicio</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/gallery" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                        <ImageIcon size={20} />
                        <span>Imágenes</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
