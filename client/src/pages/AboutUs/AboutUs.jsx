import { motion } from 'framer-motion';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-primary text-fourth px-6 py-12 flex items-center justify-center">
      <motion.div 
        className="max-w-4xl bg-white rounded-2xl shadow-lg p-10 space-y-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2 
          className="text-4xl font-bold text-tertiary"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          About Us
        </motion.h2>

        <motion.p 
          className="text-lg text-fourth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Welcome to our platform! At <span className="text-secondary font-semibold">Fotheby’s</span>, we specialize in connecting art lovers, collectors, and sellers through a seamless online auction experience.
        </motion.p>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          <motion.div 
            className="p-6 bg-primary border-l-4 border-secondary rounded-lg"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <h3 className="text-xl font-semibold mb-2 text-tertiary">Our Mission</h3>
            <p>
              To provide a secure, elegant, and transparent platform for the art community.
            </p>
          </motion.div>

          <motion.div 
            className="p-6 bg-primary border-l-4 border-tertiary rounded-lg"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <h3 className="text-xl font-semibold mb-2 text-tertiary">Why Choose Us?</h3>
            <p>
              We blend tradition with technology — offering curated auctions and expert evaluations with a modern, user-friendly experience.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
