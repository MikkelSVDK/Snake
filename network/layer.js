const Neuron = require('./neuron')

module.exports = class Layer {
  constructor(numberOfNeurons) {
    const neurons = []
    for (var j = 0; j < numberOfNeurons; j++) {
      const neuron = new Neuron()
  
      neurons.push(neuron)
    }
    
    this.neurons = neurons
  }

  toJSON() {
    return this.neurons.map(n => {
      return n.toJSON()
    })
  }
}