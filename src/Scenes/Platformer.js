class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.Scoretext; 
        this.score; 
    }

    init() {
        this.physics.world.gravity.y = 1500;
        
    }

    preload(){
        this.load.audio("playerJump", "assets/jump_08.wav");
        this.load.audio("wallSlide", "assets/cling.wav"); 
        this.load.audio("die", "assets/die.flac"); 
        this.load.audio("checkpoint", "assets/Checkpoint.mp3"); 
        this.load.audio("coin", "assets/coin10.wav"); 
        this.load.audio("gameWin", "assets/win.ogg"); 
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles')
    }

    create() {


        document.getElementById('description').innerHTML = '<h2>Game3b</h2><br>Left: A // D: Right // Space: jump // S: Ground pound // Space while slding down wall: Wall jump // Get the box at the top of the factory'
        this.map2 = this.add.tilemap("platformer-level-2", 18, 18, 50, 40); 
        this.tileset1 = this.map2.addTilesetImage("factory_tileset_packed", "tilemap_tiles2"); 
        this.tileset2 = this.map2.addTilesetImage("forest", "tilemap_tiles"); 
        this.tileset3 = this.map2.addTilesetImage("blocks", "stone_tiles");
        this.otherLayer = this.map2.createLayer("Rock", [this.tileset1, this.tileset2, this.tileset3], 0, 0); 
        this.otherLayer.setScale(2.0); 
        this.decoLayer = this.map2.createLayer("Deco", [this.tileset1, this.tileset2, this.tileset3], 0, 0); 
        this.decoLayer.setScale(2.0); 
        this.groundLayer = this.map2.createLayer("Ground-n-Platforms", [this.tileset1, this.tileset2, this.tileset3], 0, 0); 
        this.groundLayer.setScale(2.0);
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.animatedTiles.init(this.map2); 

        this.otherLayer.setScrollFactor(0.25); 
        //this.decoLayer.setScrollFactor(0.99); 
         
        
        

        this.objectLayer = this.map2.getObjectLayer("ObjectLayer"); 

        this.initalSpawn; 
        for(let object of this.objectLayer.objects){
            if(object.name === 'PlayerSpawn'){
                this.initalSpawn = object; 
                break; 
            }
        }
        this.checkpoint; 
        for(let flag of this.objectLayer.objects){
            if(flag.name === 'Flag'){
                this.checkpoint = flag; 
                break; 
            }
        }

        if (this.initalSpawn) {
            console.log(`PlayerSpawn coordinates: x = ${this.initalSpawn.x}, y = ${this.initalSpawn.y}`);
        } else {
            console.log('PlayerSpawn object not found');
        }
        
        if (!this.vfx) {
            this.vfx = {};
        }

        this.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        this.vfx.walking.stop();

        this.left = this.input.keyboard.addKey("A"); 
        this.right = this.input.keyboard.addKey("D"); 
        this.jump = this.input.keyboard.addKey("SPACE"); 
        this.stomp = this.input.keyboard.addKey("S");

        this.player = new Player(this, this.initalSpawn.x * 2, this.initalSpawn.y * 2, "platformer_characters", "tile_0000.png", this.left, this.right, this.jump, this.stomp, this.vfx); 
        this.player.setScale(1.5); 

        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.groundLayer); 

        this.cameras.main.setBounds(0, 0, this.map2.widthInPixels * 2, this.map2.heightInPixels * 2); 
        this.cameras.main.startFollow(this.player); 
        //this.cameras.main.setDeadZone(200, 200); 
        this.cameras.main.setZoom(1.5);  

        this.physics.world.setBounds(0, 0, this.map2.widthInPixels * 2, this.map2.heightInPixels * 2);



        this.coins = this.map2.createFromObjects("ObjectLayer", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        console.log(this.coins); 
          // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coins.forEach(coin => {
            coin.setScale(2.0);
            coin.x *= 2;
            coin.y *= 2;
            coin.body.updateFromGameObject(); // update the physics body to match the new scale and position
        });
        this.coinGroup = this.add.group(this.coins);
        this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            console.log("Coin touched!"); 
            this.sound.play("coin"); 
            this.score += 100; 
        });

        this.blocks = this.map2.createFromObjects("ObjectLayer", {
            name: "Smash", 
            key: "rock_sheet", 
            frame: 25
        }); 
        this.physics.world.enable(this.blocks, Phaser.Physics.Arcade.STATIC_BODY); 
        this.blocks.forEach(block => {
            block.setScale(2); 
            block.x *= 2; 
            block.y *= 2;
            block.body.updateFromGameObject();  
        }); 
        this.blockGroup = this.add.group(this.blocks); 
        //this.physics.add.collider(this.player, this.blockGroup);
        this.physics.add.collider(this.player, this.blockGroup, (player, block) => {
            //console.log("Player and block are colliding");
            this.smashBlockCallback(player, block);
        }, null, this);


        this.moves = this.map2.createFromObjects("ObjectLayer", {
            name: "MoveStart", 
            key: "rock_sheet", 
            frame: 15
        }); 
        
        this.moves.forEach(platform => {
            platform.setScale(2); 
            platform.x *= 2; 
            platform.y *= 2; 
            this.physics.world.enable(platform, Phaser.Physics.Arcade.BODY);
            platform.body.allowGravity = false;
            platform.body.immovable = true;
            platform.body.updateFromGameObject(); 

            platform.startX = platform.x;
            platform.startY = platform.y;

            platform.return = false;

            platform.update = function() {
                
                // Define a constant speed for the platforms
                const speed = 50;

                // Calculate the direction to the start and end positions
                let dirX, dirY;
                if (this.return) {
                    dirX = this.startX - this.x;
                    dirY = this.startY - this.y;
                } else {
                    dirX = this.endX - this.x;
                    dirY = this.endY - this.y;
                }

                // Normalize the direction
                let len = Math.sqrt(dirX * dirX + dirY * dirY);
                if (len > 0) {
                    dirX /= len;
                    dirY /= len;
                }

                // Move the platform along the direction
                this.body.setVelocity(dirX * speed, dirY * speed);

                // If the platform is close enough to the end position and 'return' is false, set 'return' to true
                if (Math.abs(this.endX - this.x) < 1 && Math.abs(this.endY - this.y) < 1 && !this.return) {
                    this.return = true;
                }
                // If the platform is close enough to the start position and 'return' is true, set 'return' to false
                else if (Math.abs(this.startX - this.x) < 1 && Math.abs(this.startY - this.y) < 1 && this.return) {
                    this.return = false;
                }
    
            };

        }); 

        let moveEnds = this.map2.getObjectLayer("ObjectLayer").objects.filter(object => object.name === "MoveEnd");

        // Assign the end positions to the corresponding start positions
        for (let i = 0; i < this.moves.length; i++) {
            let platform = this.moves[i];
            let end = moveEnds[i];
            platform.endX = end.x * 2;
            platform.endY = end.y * 2;
        }

        this.physics.add.collider(this.player, this.moves); 
        

        /*let moveEnds = this.map2.getObjectLayer("MoveEnd").objects;
        for (let i = 0; i < this.moves.length; i++) {
            let platform = this.moves[i];
            let end = moveEnds[i];
            platform.endX = end.x * 2;
            platform.endY = end.y * 2;
        }*/
        

        this.win =this.map2.createFromObjects("ObjectLayer", {
            name: "Win", 
            key: "tilemap_sheet", 
            frame: 30
        }); 
        this.physics.world.enable(this.win, Phaser.Physics.Arcade.STATIC_BODY);
        this.win.forEach(win => {
            win.setScale(2.0);
            win.x *= 2; 
            win.y *= 2; 
            win.body.updateFromGameObject();
        })
        this.winGroup = this.add.group(this.win); 
        this.physics.add.overlap(this.player, this.winGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            console.log("Key touched!"); 
            this.sound.play("gameWin"); 
        });


        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.Scoretext = this.add.text(16, 16, 'Score: ', { font: '64px Courier', fill: '#00ff00' });
        this.Scoretext.setOrigin(0, 0);
        this.Scoretext.setScrollFactor(1);
        this.Scoretext.setColor('#ff0000'); // This will change the color of the text to red

        this.physics.world.TILE_BIAS = 50; 

    }

    

    update() {
        this.player.update(); 
        var worldPoint = this.player.body.position; 
        this.Scoretext.setText("Score: " + this.score); 
        this.moves.forEach(platform => {
            platform.update();
        });

        

        let playerRect = new Phaser.Geom.Rectangle(worldPoint.x - 10, worldPoint.y - 10, this.player.width * 2, this.player.height * 2);
        let tiles = this.groundLayer.getTilesWithinShape(playerRect);
        for (let tile of tiles) {
            if (tile.properties.flag) {
                //this.player.updateRespawn(this.player.x, this.player.y);
                this.player.updateRespawn(this.checkpoint.x * 2, this.checkpoint.y * 2); 
                
                break;
            }
            else if(tile.properties.isHazard){
                this.player.resetPlayer(); 
                
                break; 
            }
            else if(tile.properties.belt){
                if(!this.player.body.blocked.left){
                    this.player.x += -1; 
                    break; 
                }
                else{
                    console.log("We shouldn't be passing this!"); 
                    break; 
                }
                
            }
            else if(tile.properties.spring){
                this.player.body.setVelocityY(-1600); 
            }
            
        }
    }

    smashBlockCallback(player, block){
        console.log("We are touching the block"); 
        if(player.returnStomp() === true){
            console.log("Block should be destroyed"); 
            block.destroy();  
        }
        
        
    }
}