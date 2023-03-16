const clc = require('cli-color')

const Network = require('./network/network')
const World = require('./snake/world')

let globalTimeout = false, globalGen = 0, globalHeu = 0

let trainingData = [
  { input: [0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0], output: [0, 0, 0] }
]

let mutations = 0.5
let dataMutations = 0.1

let network = new Network([11, 10, 3])
network.setLearningRate(0.3);

(async () => {
  for(var n = 0; n < 100; n ++) {
    globalGen++

    globalTimeout = false
    let games = await initMultibleGames(trainingData)

    games.sort((a, b) => b.heuristic - a.heuristic)
    globalHeu = games[0].heuristic
    trainingData = games[0].trainingData

    globalTimeout = true
    await sleep(50)
    globalTimeout = false
    
    initGame(trainingData, true)
  }
  initGame(trainingData, true)
})()

function initMultibleGames(trainingDataMultible, count = 20) {
  let resolved = 0
  let games = []
  return new Promise((resolve) => {
    for (let i = 0; i < count; i++) {
      initGame(trainingDataMultible).then(data => {
        games.push(data)
        resolved++

        if(resolved == count)
          resolve(games)
      })
    }
  })
}

async function initGame(trainingDataSingleRef, display = false){
  let trainingDataSingle = JSON.parse(JSON.stringify(trainingDataSingleRef))
  if(Math.random() < mutations){
    mutations -= 0.00005
    if(Math.random() < dataMutations){
      dataMutations -= 0.0005
      trainingDataSingle.push({ input: [0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0], output: [0, 0, 0] })
    }
    
    let dataI = getRandomNumber(0, trainingDataSingle.length - 1)
    for (let i = 0; i < trainingDataSingle[dataI].input.length; i++) {
      let max = 0.005, min = -0.005
      trainingDataSingle[dataI].input[i] = Math.random() < mutations ? 
      Math.max(
        Math.min(
          trainingDataSingle[dataI].input[i] + (Math.random() * (max - min) + min)
        , 1)
      , 0)
      : trainingDataSingle[dataI].input[i]
    }
    for (let i = 0; i < trainingDataSingle[dataI].output.length; i++) {
      let max = 0.005, min = -0.005
      trainingDataSingle[dataI].output[i] = Math.random() < mutations ? 
      Math.max(
        Math.min(
          trainingDataSingle[dataI].output[i] + (Math.random() * (max - min) + min)
        , 1)
      , 0)
      : trainingDataSingle[dataI].output[i]
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
  let worldToNet, netToDirection, lastScore, start = Date.now()
  while(!globalTimeout && !world.snake.dead){
    network.activate(worldToNet = world.toNet())
    world.snake.setDirection(netToDirection = network.run())
    world.snake.move()
    
    if(display){
      console.clear()
      console.log(`score: ${world.score} | gen: ${globalGen} | heuristic: ${globalHeu.toFixed(4)} | mutation: ${mutations.toFixed(4)} | dataMutation: ${dataMutations.toFixed(4)}`)
      console.log(world.toString())

      let netToDirectionBest = netToDirection.indexOf(Math.max.apply(0,netToDirection))
      console.log(`walls:\nstraight: ${worldToNet[0]} | right: ${worldToNet[1]} | left: ${worldToNet[2]}\n\ndirection:\nleft: ${worldToNet[3]} | right: ${worldToNet[4]} | up: ${worldToNet[5]} | down: ${worldToNet[6]}\n\nfood:\nleft: ${worldToNet[7].toFixed(3)} | right: ${worldToNet[8].toFixed(3)} | up: ${worldToNet[9].toFixed(3)} | down: ${worldToNet[10].toFixed(3)}\n\nnet:\nstraight: ${netToDirectionBest == 0 ? clc.greenBright(netToDirection[0].toFixed(3)) : clc.red(netToDirection[0].toFixed(3))} | right: ${netToDirectionBest == 1 ? clc.greenBright(netToDirection[1].toFixed(3)) : clc.red(netToDirection[1].toFixed(3))} | left: ${netToDirectionBest == 2 ? clc.greenBright(netToDirection[2].toFixed(3)) : clc.red(netToDirection[2].toFixed(3))}`)
    }

    if(world.snake.lastFood + 2000 < Date.now()){
      world.snake.dead = true
      heuristic -= 1
    }

    if(world.score > lastScore){
      heuristic += 1

      lastScore = world.score
    }
    
    await sleep(10)
  }

  heuristic += ((Date.now() - start) / 1000)

  if(world.snake.lastFood + 2000 > Date.now()){
    let i = trainingData.findIndex(i => 
      i.input[0] == worldToNet[0] &&
      i.input[1] == worldToNet[1] &&
      i.input[2] == worldToNet[2] &&
      i.input[3] == worldToNet[3] &&
      i.input[4] == worldToNet[4] &&
      i.input[5] == worldToNet[5] &&
      i.input[6] == worldToNet[6]
    )
    if(i == -1)
      trainingData.push({
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}