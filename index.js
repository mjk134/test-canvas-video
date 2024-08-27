const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const path = require('path')
const { FFCreator, FFScene, FFImage } = require('ffcreator')
const ffmpeg = require('fluent-ffmpeg')
const canvas = createCanvas(3840, 2160)
const ctx = canvas.getContext('2d')
const file = fs.readFileSync('test.png');
const buf = file.buffer;
const arr = new Uint8Array(buf);
const zerosAndOnes = [];
let splitArr = [];

arr.forEach((byte) => {
    let binary = byte.toString(2).padStart(8, '0');
    // convert binary string to array of zeros and ones
    binary.split('').forEach((bit) => {
        zerosAndOnes.push(parseInt(bit));
    });
});

const size = 12; //240 is the largest since its gcf
const maxSize =  (3840 * 2160) / Math.pow(size, 2) // size 12^2 pixels for 1
console.log('maxSize:', maxSize)

const split = (arr, size) => {
    const res = [];
    while (arr.length) {
        res.push(arr.splice(0, size));
    }
    return res;
}

splitArr = split(zerosAndOnes, maxSize);
console.log('length:', splitArr.length)

const imgData = []

const formatIndex = (index) => {
    return index.toString().padStart(3, '0')

}

splitArr.forEach((bitArr, index) => {
    console.log('sync', index + 1)
    let totalBits = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < canvas.width; x += size) {
        for (let y = 0; y < canvas.height; y += size) {
            if (totalBits >= bitArr.length) break; // EOF DATA
            ctx.fillStyle = bitArr[totalBits] === 1 ? '#000000' : '#FFFFFF';
            ctx.fillRect(x, y, size, size)
            totalBits++;
        }
    }
    canvas.createJPEGStream({ quality: 1 }).pipe(fs.createWriteStream(`output/${formatIndex(index)}.jpg`))
    const img = canvas.toDataURL('image/jpeg', 1)
    imgData.push(img)
});

// generate img tags into output file
fs.writeFileSync('output.html', `<html><body>${imgData.map(img => `<img src="${img}" />`).join('')}</body></html>`)

const outputDir = path.join(__dirname, 'output'); // replace with your directory if not 'output'




// setTimeout(async () => {
//     const files = await fs.promises.readdir('output')
//     console.log('files:', files)

//     let proc = ffmpeg()
//   // loop for 5 seconds
//   // using 25 fps
//   // setup event handlers


// files.forEach((file, index) => {
//     if (file === 'output.mp4') return;
//     proc.input(path.join(outputDir, file))
//     proc.fps(1)
//     proc.keepPixelAspect()
// })
// proc.on('end', function() {
//     console.log('file has been converted succesfully');
//   })
// proc.on('error', function(err) {
//     console.log('an error happened: ' + err.message);
//   })
//   // save to file
// proc.save(path.join(outputDir, 'output.mp4'));

// }, 10000);
/* 
New method:
 - Comvert each image to mp4
 - Concatenate the mp4 files using ffmpeg
 - Done
*/

setTimeout(async () => {
    // 1. Convert each image to mp4
    let files = await fs.promises.readdir('output')

    await Promise.all(files.map(async (file, index) => {

        if (file === 'output.mp4') return;

        return new Promise((resolve) => {

        const proc = ffmpeg()
        proc.input(path.join(outputDir, file))
        proc.fps(1)
        proc.keepPixelAspect()
        proc.save(path.join(outputDir, `${index}.mp4`));

        proc.on('end', function() {
            console.log('file has been converted succesfully');
            resolve()
        })
        })
    }));

    
    
    files = (await fs.promises.readdir('output')).filter(file => file.endsWith('.mp4'))

    console.log('files', files)

    // 2. Concatenate the mp4 files
    const concat = ffmpeg()
    files.forEach((file, index) => {
        if (file === 'output.mp4') return;
        concat.input(path.join(outputDir, `${index}.mp4`))
    })
    concat.on('end', function() {
        console.log('file has been converted succesfully');
    })
    concat.on('error', function(err) {
        console.log('an error happened: ' + err.message);
    })
    concat.fps(1)
    concat.keepPixelAspect()
    concat.save(path.join(outputDir, `output.mp4`));
}, 1000)



// const creator = new FFCreator({
//     cacheDir: 'cache/',
//     output: 'output/output.mp4',
//     width: 3840,
//     height: 2160,
//     debug: true,
// });

// files.forEach((file) => {
//     console.log('sync', file)
//     const scene = new FFScene();
//     const img = new FFImage({ path: , x:path.join(outputDir, file) 0, y: 0, width: 3840, height: 2160});
//     scene.addChild(img);
//     scene.setDuration(1);
//     creator.addChild(scene);
// });

// creator.start();
// creator.on('error', (e) => {
//     console.log(`FFCreator error: ${e.error}`);
// });
// creator.on('progress', (e) => {
//     console.log(`FFCreatorLite progress: ${e.percent}`);
// });
// creator.on('complete', (e) => {
//     console.log(`FFCreatorLite complete: ${e.output}`);
// });



