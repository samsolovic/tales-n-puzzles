// Phaser is loaded as a global UMD bundle in index.html. Re-export it so the
// rest of the project can use normal ES module imports without a bundler.
const Phaser = window.Phaser;
if (!Phaser) throw new Error('Phaser failed to load.');
export default Phaser;
