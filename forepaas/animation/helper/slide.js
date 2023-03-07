import { spring } from 'react-router-transition'

function glide (val) {
  return spring(val, {
    stiffness: 140,
    damping: 40
  })
}

export default {
  mapStyles: (styles) => {
    return {
      opacity: styles.opacity,
      transform: `translateX(${styles.offset}px)`
    }
  },
  pageTransitions: {
    atEnter: {
      offset: 200,
      opacity: 0
    },
    atLeave: {
      offset: glide(-100),
      opacity: glide(0)
    },
    atActive: {
      offset: glide(0),
      opacity: glide(1)
    }
  }
}
