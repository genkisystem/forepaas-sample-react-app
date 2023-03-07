export default {
  mapStyles: (styles) => {
    return {
      opacity: styles.opacity
    }
  },
  pageTransitions: {
    atEnter: {
      opacity: 0
    },
    atLeave: {
      opacity: 0
    },
    atActive: {
      opacity: 1
    }
  }
}
