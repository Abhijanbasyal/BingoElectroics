export const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 } 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.2,
      staggerChildren: 0.05,
      when: "beforeChildren"
    } 
  },
};

export const dropdownItemVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, y: 0 }
};