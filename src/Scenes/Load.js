class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        this.load.image("tilemap_tiles2", "tilemap2_packed.png"); 
        this.load.image("stone_tiles", "rock_packed.png");
        this.load.tilemapTiledJSON("platformer-level-2", "platformer-level-2.tmj"); 
        this.load.tilemapTiledJSON("platformer-level-3", "platformer-level-3.tmj"); 
        this.load.tilemapTiledJSON("platformer-level-4", "platformer-level-4.tmj"); 

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("rock_sheet", "rock_packed.png", {
            frameWidth: 18, 
            frameHeight: 18
        })

        this.load.image("enemy1", "enemy.png"); 
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        

        //const jumpSound = this.sound.add('playerJump'); 
        
        

         // ...and pass to the next Scene
         this.scene.start("titleScreen");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}