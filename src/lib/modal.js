export const openModal = () => {
  document.getElementById('crud-modal').classList.remove('hidden')
  document.getElementById('crud-modal').classList.add('flex')
}

export const closeModal = () => {
  document.getElementById('crud-modal').classList.remove('flex')
  document.getElementById('crud-modal').classList.add('hidden')
}
