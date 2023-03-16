const sigmoid = require('./sigmoid')
const Connection = require('./connection')
const Layer = require('./layer')

module.exports = class Network {
  constructor(numberOfLayers) {
    this.layers = numberOfLayers.map((length, index) => {
      const layer = new Layer(length) 
      if (index !== 0 ) {
        layer.neurons.forEach(neuron => {
          neuron.setBias(neuron.getRandomBias())
        })
      }
      return layer
    })
    this.learningRate = 0.3
    this.momentum =  0.1
    this.iterations = 0
    this.connectLayers()
  }

  toJSON() {
    return {
      learningRate: this.learningRate,
      iterations: this.iterations,
      layers: this.layers.map(l => l.toJSON())
    }
  }

  setLearningRate(value) {
    this.learningRate = value
  }

  setIterations(val) {
    this.iterations = val
  }

  connectLayers() {
    for (var layer = 1; layer < this.layers.length; layer++) {
      const thisLayer = this.layers[layer]
      const prevLayer = this.layers[layer - 1]
      for (var neuron = 0; neuron < prevLayer.neurons.length; neuron++) {
        for(var neuronInThisLayer = 0; neuronInThisLayer < thisLayer.neurons.length; neuronInThisLayer++) {
          const connection = new Connection(prevLayer.neurons[neuron], thisLayer.neurons[neuronInThisLayer])
          prevLayer.neurons[neuron].addOutputConnection(connection)
          thisLayer.neurons[neuronInThisLayer].addInputConnection(connection)
        }
      }
    }
  }

  train(input, output) {
    this.activate(input)

    // Forward propagate
    this.runInputSigmoid()

    // backpropagate
    this.calculateDeltasSigmoid(output)
    this.adjustWeights()
    
    this.setIterations(this.iterations + 1)
  }

  activate(values) {
    this.layers[0].neurons.forEach((n, i) => {
      n.setOutput(values[i])
    })
  }

  run() {
    return this.runInputSigmoid()
  }

  runInputSigmoid() {
    for (var layer = 1; layer < this.layers.length; layer++) {
      for (var neuron = 0; neuron < this.layers[layer].neurons.length; neuron++) {
        const bias = this.layers[layer].neurons[neuron].bias
        
        const connectionsValue = this.layers[layer].neurons[neuron].inputConnections.reduce((prev, conn)  => {
          const val = conn.weight * conn.from.output
          return prev + val
        }, 0) 

        this.layers[layer].neurons[neuron].setOutput(sigmoid(bias + connectionsValue))
      }
    }

    return this.layers[this.layers.length - 1].neurons.map(n => n.output)
  }

  calculateDeltasSigmoid(target) {
    for (let layer = this.layers.length - 1; layer >= 0; layer--) {
      const currentLayer = this.layers[layer]

      for (let neuron = 0; neuron < currentLayer.neurons.length; neuron++) {
        const currentNeuron = currentLayer.neurons[neuron]
        let output = currentNeuron.output;

        let error = 0
        // Check if layer is output layer
        if (layer === this.layers.length -1)
          error = target[neuron] - output
        else {
          for (let k = 0; k < currentNeuron.outputConnections.length; k++) {
            const currentConnection = currentNeuron.outputConnections[k]
            error += currentConnection.to.delta * currentConnection.weight
          }
        }
        currentNeuron.setError(error)
        currentNeuron.setDelta(error * output * (1 - output))
      }
    }
  }

  adjustWeights() {
    for (let layer = 1; layer <= this.layers.length -1; layer++) {
      const prevLayer = this.layers[layer - 1]
      const currentLayer = this.layers[layer]

      for (let neuron = 0; neuron < currentLayer.neurons.length; neuron++) {
         const currentNeuron = currentLayer.neurons[neuron]
         let delta = currentNeuron.delta
         
        for (let i = 0; i < currentNeuron.inputConnections.length; i++) {
          const currentConnection = currentNeuron.inputConnections[i]
          let change = currentConnection.change
         
          change = (this.learningRate * delta * currentConnection.from.output)
              + (this.momentum * change);
          
          currentConnection.setChange(change)
          currentConnection.setWeight(currentConnection.weight + change)
        }

        currentNeuron.setBias(currentNeuron.bias + (this.learningRate * delta))
      }
    }
  }

}