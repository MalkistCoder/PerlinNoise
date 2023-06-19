import PerlinNoise from './helpers/perlin'
import './reset.css'
import './style.css'

const config = {
    width: 8,
    height: 8,
    cellSize: 64,

    seed: 0, // integer

    octaves: 3, // integer
    lacunarity: 2, // number, + = more frequency, - = less frequency
    persistence: 0.5, // 0-1, + = more amplitude, - = less amplitude
}


const canvas: HTMLCanvasElement = document.getElementById('noise')! as HTMLCanvasElement
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!

canvas.width = config.width * config.cellSize
canvas.height = config.height * config.cellSize

function setPixel(x: number, y: number, color: string): void {
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
}

let perlins: Array<PerlinNoise> = []

function initPerlins(seed: number) {
    perlins = []

    for (let octaveIndex = 1; octaveIndex <= config.octaves; octaveIndex++) {
        perlins.push(new PerlinNoise(Math.ceil(config.width * Math.pow(config.lacunarity, octaveIndex)), Math.ceil(config.height * Math.pow(config.lacunarity, octaveIndex)), seed + octaveIndex))
    }
}

initPerlins(config.seed)

function fractalPerlinNoise(x: number, y: number): number { // returns floating point from 0 to 1
    let value = 0
    let relativeAmplitude = 1
    let relativeFrequency = 1

    for (let octave = 0; octave < perlins.length; octave++) {
        value += perlins[octave].perlin(x * relativeFrequency, y * relativeFrequency) * relativeAmplitude
        relativeAmplitude *= config.persistence
        relativeFrequency *= config.lacunarity
    }
    let clampedValue = Math.min(Math.max((value + 1) / 2, 0), 1) // 0 to 1

    return clampedValue
}

function render(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < config.height * config.cellSize; y++) {
        for (let x = 0; x < config.width * config.cellSize; x++) {
            const value = fractalPerlinNoise(x / config.cellSize, y / config.cellSize)
            const color = `hsl(0, 0%, ${value * 100}%)`

            setPixel(x, y, color)
        }
    }
}

render()

document.getElementById('use-seed')!.addEventListener('change', () => {
    const seedElement: HTMLInputElement = document.getElementById('seed')! as HTMLInputElement
    seedElement.disabled = !seedElement.disabled
})

document.getElementById('generate')!.addEventListener('click', (e: MouseEvent) => {
    const generateButton: HTMLButtonElement = e.target as HTMLButtonElement

    generateButton.disabled = true

    config.width = parseInt((document.getElementById('size-x')! as HTMLInputElement).value) || 8
    config.height = parseInt((document.getElementById('size-y')! as HTMLInputElement).value) || 8

    config.cellSize = Math.round(512 / config.height)

    canvas.width = config.width * config.cellSize
    canvas.height = config.height * config.cellSize

    config.seed = (document.getElementById('use-seed')! as HTMLInputElement).checked ? parseInt((document.getElementById('seed')! as HTMLInputElement).value) || 0 : Math.floor(Math.random() * 4294967296)

    config.octaves = parseInt((document.getElementById('octaves')! as HTMLInputElement).value) || 1
    config.lacunarity = parseFloat((document.getElementById('lacunarity')! as HTMLInputElement).value) || 2
    config.persistence = parseFloat((document.getElementById('persistence')! as HTMLInputElement).value) || 0.5


    console.log(`Perlin noise: ${config.width}x${config.height} (${config.width * config.height} cells) with ${config.octaves} octaves (L: ${config.lacunarity}, P: ${config.persistence}) (Seed: ${config.seed})`)
    initPerlins(config.seed)
    render()

    setTimeout(() => {
        generateButton.disabled = false
    }, 500)
})
