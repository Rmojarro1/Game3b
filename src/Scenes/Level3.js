class Level3 extends Phaser.Scene {
    constructor() {
        super("platformerScene3");
        this.Scoretext; 
        this.score = 0; 
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


        document.getElementById('description').innerHTML = '<h2>Game4b</h2><br>Left: A // D: Right // Space: jump // S: Ground pound // Space while slding down wall: Wall jump //'
        this.map2 = this.add.tilemap("platformer-level-4", 18, 18, 50, 40); //2 oe 3
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
        this.objectLayer = this.map2.getObjectLayer("ObjectLayer"); 

        this.initalSpawn; 
        for(let object of this.objectLayer.objects){
            if(object.name === 'PlayerSpawn'){
                this.initalSpawn = object; 
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
            scale: {start: 0.03, end: 0.1},
            lifespan: 350,
            alpha: {start: 1, end: 0.1}, 
        });

        this.vfx.walking.stop();
        //testing

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
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coins.forEach(coin => {
            coin.setScale(2.0);
            coin.x *= 2;
            coin.y *= 2;
            coin.body.updateFromGameObject(); 
        });
        this.coinGroup = this.add.group(this.coins);
        this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();  
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
        this.physics.add.collider(this.player, this.blockGroup, (player, block) => {
            this.smashBlockCallback(player, block);
        }, null, this);


        this.moves = this.map2.createFromObjects("ObjectLayer", {
            name: "MoveStart", 
            key: "rock_sheet", 
            frame: 15
        }); 

        this.eSpawn; 
        for(let object of this.objectLayer.objects){
            if(object.name === 'EnemySpawn'){
                this.eSpawn = object; 
                //break; 
            }
        }

        this.enemy = this.add.sprite(this.eSpawn.x * 2,  this.eSpawn.y *2, "enemy1"); 
        this.enemy.setScale(2); 
        this.physics.world.enable(this.enemy, Phaser.Physics.Arcade.BODY);
        this.enemy.body.allowGravity = false;
        this.enemy.body.immovable = true; 
        this.physics.add.collider(this.player, this.enemy, (player, enemy) => {
            this.enemyCallback(player, enemy); 
        }, null, this); 
        
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

                const speed = 50;
                let dirX, dirY;
                if (this.return) {
                    dirX = this.startX - this.x;
                    dirY = this.startY - this.y;
                } else {
                    dirX = this.endX - this.x;
                    dirY = this.endY - this.y;
                }
                let len = Math.sqrt(dirX * dirX + dirY * dirY);
                if (len > 0) {
                    dirX /= len;
                    dirY /= len;
                }
                this.body.setVelocity(dirX * speed, dirY * speed);
                if (Math.abs(this.endX - this.x) < 1 && Math.abs(this.endY - this.y) < 1 && !this.return) {
                    this.return = true;
                }
                else if (Math.abs(this.startX - this.x) < 1 && Math.abs(this.startY - this.y) < 1 && this.return) {
                    this.return = false;
                }
    
            };

        }); 

        let moveEnds = this.map2.getObjectLayer("ObjectLayer").objects.filter(object => object.name === "MoveEnd");

        for (let i = 0; i < this.moves.length; i++) {
            let platform = this.moves[i];
            let end = moveEnds[i];
            platform.endX = end.x * 2;
            platform.endY = end.y * 2;
        }

        this.physics.add.collider(this.player, this.moves); 

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
            obj2.destroy();
            let gameWinSound = this.sound.add("gameWin");
            gameWinSound.play();
            gameWinSound.once('complete', () => {
                this.scene.start('playerWin');
            });
        });

        this.Scoretext = this.add.text(16, 16, 'Score: ', { font: '64px Courier', fill: '#00ff00' });
        this.Scoretext.setColor('#ff0000'); 

        this.physics.world.TILE_BIAS = 100; 

    }

    

    update() {
        this.player.update(); 
         
        this.Scoretext.setText("Score: " + this.score); 

        this.Scoretext.x = this.cameras.main.scrollX + 250;
        this.Scoretext.y = this.cameras.main.scrollY + 150;

        //console.log("Camera " + this.Scoretext.x + "," + this.Scoretext.y); 

        var worldPoint = this.player.body.position;
        this.moves.forEach(platform => {
            platform.update();
        });

        

        let playerRect = new Phaser.Geom.Rectangle(worldPoint.x - 10, worldPoint.y - 10, this.player.width * 2, this.player.height * 2);
        let tiles = this.groundLayer.getTilesWithinShape(playerRect);
        for (let tile of tiles) {
            if (tile.properties.flag) {
                /*this.player.updateRespawn(this.checkpoint.x * 2, this.checkpoint.y * 2); 
                break;*/
                let worldPoint = this.map2.tileToWorldXY(tile.x, tile.y);

                this.player.updateRespawn(worldPoint.x, worldPoint.y);
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

    enemyCallback(player, enemy){
        player.resetPlayer(); 
    }
}