export const submenuVariants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: { 
      duration: 0.3, 
      ease: 'easeInOut',
      staggerChildren: 0.05,
      when: "beforeChildren"
    }
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { 
      duration: 0.3, 
      ease: 'easeInOut',
      when: "afterChildren"
    }
  },
};

export const submenuItemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -10 }
};