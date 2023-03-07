import bounce from './helper/bounce'
import opacity from './helper/opacity'
import slide from './helper/slide'

/**
 * @type {Object}
 * This is the animation when changing route
 * You can configure it by with "animation" parameter in config
 * Can be bounce, opacity, slide
 * To create an animation
 * @example
 * configuration : {
 *  "animation": "bounce"
 * }
 */
let animation = {
  animate: {
    bounce,
    opacity,
    slide
  },
  error: (name) => {
    let list = 'You can choose from this list:\n'
    Object.keys(animation.animate).forEach((key, index) => {
      list += `\t- ${key}\n`
    })
    console.error(`Animation "${name}" not found.\n${list}`)
  }
}

export default animation
