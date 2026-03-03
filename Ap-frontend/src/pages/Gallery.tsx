import { motion } from 'framer-motion';

const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', title: 'Naturaleza Pura' },
    { id: 2, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', title: 'Bosque Profundo' },
    { id: 3, url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80', title: 'Montañas Azules' },
    { id: 4, url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80', title: 'Camino al Alba' },
    { id: 5, url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80', title: 'Cascadas Vivas' },
    { id: 6, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', title: 'Cumbres Nevadas' },
];

const Gallery = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="gallery-container"
            style={{ padding: '0 1rem' }}
        >
            <h1>Galería de Imágenes</h1>
            <div className="gallery-grid">
                {images.map((img, index) => (
                    <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="gallery-item glass-effect"
                    >
                        <img src={img.url} alt={img.title} className="gallery-image" />
                        <div className="gallery-overlay">
                            <span style={{ fontWeight: '600', color: 'white' }}>{img.title}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Gallery;
