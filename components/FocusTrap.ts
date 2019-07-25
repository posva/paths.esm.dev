import Vue, { VNode } from 'vue'
import Component from 'vue-class-component'
import createFocusTrap, { FocusTrap as FocusTrapI } from 'focus-trap'

@Component({
  props: {
    initialFocus: Function,
    active: Boolean,
  },
})
export default class FocusTrap extends Vue {
  // @ts-ignore
  trap: FocusTrapI

  mounted() {
    // @ts-ignore
    const initialFocus = this.initialFocus || (() => this.$el)

    this.trap = createFocusTrap(
      // @ts-ignore
      this.$el,
      {
        escapeDeactivates: false,
        allowOutsideClick: true,
        initialFocus,
      }
    )
    this.trap.activate()

    this.$watch(
      'active',
      (active) => {
        if (active) this.trap.unpause()
        else this.trap.pause()
      },
      { immediate: true }
    )
  }

  beforeDestroy() {
    this.trap.deactivate()
  }

  render() {
    const content = this.$slots.default
    // TODO: warnings
    if (!content) throw new Error('needs content')
    if (!content.length) throw new Error('needs content')
    if (content.length > 1) throw new Error('only one child')

    return content[0]
  }
}
