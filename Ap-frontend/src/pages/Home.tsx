import { motion } from 'framer-motion';

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ padding: '2rem', textAlign: 'center' }}
        >
            <h1>Bienvenido a la Plataforma AP</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                Explora nuestra colección de imágenes con una interfaz moderna, fluida y diseñada para la mejor experiencia de usuario.
            </p>
            <div style={{ marginTop: '3rem' }}>
                <button className="glass-effect" style={{
                    padding: '1rem 2.5rem',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                }}>
                    Empezar a Explorar
                </button>
            </div>
        </motion.div>
    );
};

export default Home;
