<script>
import Tree from './components/Tree.vue'
import Modal from './components/Modal.vue'

export default {
  // global awareness
  name: 'App',

  // template dependencies
  components: {
    Tree,
    Modal
  },
  // local state
  data() {
    return {
      showModal: false
    }
  }
}
</script>

<template>
  <div id="app">
    <h1>Title is set in App.vue </h1>

    <tree />
 
    <!-- use the modal component, pass in the prop -->
    <modal :show="showModal" @close="showModal = false">
      <template #header>
        <h3>custom header</h3>
      </template>
    </modal>
  </div>
</template>

<style>
.item {
  cursor: pointer;
  line-height: 1.5;
}
.bold {
  font-weight: bold;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>