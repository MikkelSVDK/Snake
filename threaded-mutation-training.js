const { Worker, isMainThread, parentPort } = require('worker_threads')
const clc = require('cli-color')

const Network = require('./network/network')
const World = require('./snake/world')

let mutations = 0.5
let dataMutations = 0.1

let workers = []
if (isMainThread) {
  let generationCount = 0, heuristic = 0, nextGenerationReady = false
  let trainingData = [
    { input: [0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0], output: [0, 0, 0] }
  ]

  for (let i = 0; i < 4; i++) {
    const worker = new Worker(__filename)
    workers.push(worker)
  }

  (async () => {
    while (heuristic < 50) {
      for (let i = 0; i < workers.length; i++) {
        workers[i].postMessage(JSON.stringify(trainingData))
      }

      let generation = await multibleWorkerMessages()
      
      generationCount++

      nextGenerationReady = true
      
      generation.sort((a, b) => b.heuristic - a.heuristic)
      heuristic = generation[0].heuristic
      trainingData = generation[0].trainingData
      
      await sleep(500)
      nextGenerationReady = false
      displayBest(trainingData)
    }
  })()

  function workerMessage(worker){
    return new Promise((resolve) => {
      worker.once('message', resolve)
    })
  }

  function multibleWorkerMessages() {
    let generations = []
    let messageCount = 0

    return new Promise((resolve) => {
      for (let i = 0; i < workers.length; i++) {
        workers[i]
        workerMessage(workers[i]).then(generation => {
          generations = [...generations, ...generation]
          messageCount++
          
          if(workers.length == messageCount)
            resolve(generations)
        })
      }
    })
  }

  async function displayBest(trainingDataSingle){
    let network = new Network([11, 10, 3])
    network.setLearningRate(0.3)
  
    for(var i = 0; i < 2000; i ++) {
      const trainingItem = trainingDataSingle[Math.floor((Math.random() * trainingDataSingle.length))]
      network.train(trainingItem.input, trainingItem.output);
    }

    let world = new World(15, 40)
    let worldToNet, netToDirection
    while(!nextGenerationReady && !world.snake.dead){
      network.activate(worldToNet = world.toNet())
      world.snake.setDirection(netToDirection = network.run())
      world.snake.move()
      
      console.clear()
      console.log(`score: ${world.score} | gen: ${generationCount} | heuristic: ${heuristic.toFixed(4)} | mutation: ${mutations.toFixed(4)} | dataMutation: ${dataMutations.toFixed(4)}`)
      console.log(world.toString())

      let netToDirectionBest = netToDirection.indexOf(Math.max.apply(0, netToDirection))
      console.log(`walls:\nstraight: ${worldToNet[0]} | right: ${worldToNet[1]} | left: ${worldToNet[2]}\n\ndirection:\nleft: ${worldToNet[3]} | right: ${worldToNet[4]} | up: ${worldToNet[5]} | down: ${worldToNet[6]}\n\nfood:\nleft: ${worldToNet[7].toFixed(3)} | right: ${worldToNet[8].toFixed(3)} | up: ${worldToNet[9].toFixed(3)} | down: ${worldToNet[10].toFixed(3)}\n\nnet:\nstraight: ${netToDirectionBest == 0 ? clc.greenBright(netToDirection[0].toFixed(3)) : clc.red(netToDirection[0].toFixed(3))} | right: ${netToDirectionBest == 1 ? clc.greenBright(netToDirection[1].toFixed(3)) : clc.red(netToDirection[1].toFixed(3))} | left: ${netToDirectionBest == 2 ? clc.greenBright(netToDirection[2].toFixed(3)) : clc.red(netToDirection[2].toFixed(3))}`)
      
      await sleep(100)
    }
  }

} else {
  parentPort.on('message', async (trainingDataJSON) => {
    let trainingData = JSON.parse(trainingDataJSON)

    let generation = await initMultibleGames(trainingData)
    
    parentPort.postMessage(generation)
  })

  function initMultibleGames(trainingDataMultible, count = 10) {
    let resolved = 0
    let generations = []
    return new Promise((resolve) => {
      for (let i = 0; i < count; i++) {
        initGame(trainingDataMultible, !(i == 0)).then(data => {
          generations.push(data)
          resolved++
  
          if(resolved == count)
            resolve(generations)
        })
      }
    })
  }
  
  async function initGame(trainingDataSingleRef, mutate = true){
    let trainingDataSingle = JSON.parse(JSON.stringify(trainingDataSingleRef))
    if(Math.random() < mutations && mutate){
      if(Math.random() < dataMutations){
        trainingDataSingle.push({ input: [0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0], output: [0, 0, 0] })
      }
      
      let dataI = getRandomNumber(0, trainingDataSingle.length - 1)
      for (let i = 0; i < trainingDataSingle[dataI].input.length; i++) {
        let max = 0.5, min = -0.5
        trainingDataSingle[dataI].input[i] = Math.random() < mutations ? Math.max(Math.min(trainingDataSingle[dataI].input[i] + (Math.random() * (max - min) + min), 1), 0) : trainingDataSingle[dataI].input[i]
      }
      for (let i = 0; i < trainingDataSingle[dataI].output.length; i++) {
        let max = 0.5, min = -0.5
        trainingDataSingle[dataI].output[i] = Math.random() < mutations ? Math.max(Math.min(trainingDataSingle[dataI].output[i] + (Math.random() * (max - min) + min), 1), 0) : trainingDataSingle[dataI].output[i]
      }
    }
  
    let heuristic = 0
  
    let network = new Network([11, 10, 3])
    network.setLearningRate(0.3)
  
    for(var i = 0; i < 2000; i ++) {
      const trainingItem = trainingDataSingle[Math.floor((Math.random() * trainingDataSingle.length))]
      network.train(trainingItem.input, trainingItem.output);
    }
    
    let world = new World(15, 40)
    let worldToNet, netToDirection, lastScore = 0, start = Date.now()
    while(!world.snake.dead){
      network.activate(worldToNet = world.toNet())
      world.snake.setDirection(netToDirection = network.run())
      world.snake.move()
  
      if(world.snake.lastFood + 1000 < Date.now()){
        world.snake.dead = true
        heuristic -= 1
      }
  
      if(world.score > lastScore){
        heuristic += 1
  
        lastScore = world.score
      }
      
      //await sleep(0)
    }
  
    //heuristic += ((Date.now() - start) / 1000)
  
    if(world.snake.lastFood + 1000 > Date.now()){
      let i = trainingDataSingle.findIndex(i => 
        i.input[0] == worldToNet[0] &&
        i.input[1] == worldToNet[1] &&
        i.input[2] == worldToNet[2] &&
        i.input[3] == worldToNet[3] &&
        i.input[4] == worldToNet[4] &&
        i.input[5] == worldToNet[5] &&
        i.input[6] == worldToNet[6]
      )
      if(i == -1)
        trainingDataSingle.push({
          input: [
            worldToNet[0],
            worldToNet[1],
            worldToNet[2],
            worldToNet[3],
            worldToNet[4],
            worldToNet[5],
            worldToNet[6],
            0,
            0,
            0,
            0
          ],
          output: [
            1 - worldToNet[0],
            worldToNet[0] == 0 ? 0 : 1 - worldToNet[1],
            worldToNet[0] == 0 ? 0 : 1 - worldToNet[2]
          ]
        })
    }
  
    return { trainingData: trainingDataSingle, heuristic }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}