// panda-game.js - თამაშის ძირითადი ბირთვი
const canvas = document.getElementById("gameCanvas");
if (canvas) {
    const ctx = canvas.getContext("2d");

    // ფიზიკის პარამეტრები
    const gravity = 0.5;

    // პერსონაჟი (პანდა)
    const panda = {
        x: 100,
        y: 200,
        width: 45,
        height: 45,
        velocityX: 0,
        velocityY: 0,
        speed: 5,
        jumpForce: 11,
        grounded: false
    };

    // პლატფორმები (დაახლოებით ისე, როგორც შენს ფოტოზეა - თბილისის ქუჩების პლატფორმები)
    const platforms = [
        // მთავარი მიწა
        { x: 0, y: 350, width: 800, height: 50, color: "#57606f" }, 
        // მაღალი პლატფორმები (Tbilisi Streets სტილი)
        { x: 250, y: 250, width: 150, height: 20, color: "#d2dae2" },
        { x: 500, y: 180, width: 180, height: 20, color: "#d2dae2" }
    ];

    // ღილაკების მოსმენა
    const keys = { Right: false, Left: false, Up: false };

    window.addEventListener("keydown", (e) => {
        if (e.code === "ArrowRight" || e.code === "KeyD") keys.Right = true;
        if (e.code === "ArrowLeft" || e.code === "KeyA") keys.Left = true;
        if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") keys.Up = true;
    });

    window.addEventListener("keyup", (e) => {
        if (e.code === "ArrowRight" || e.code === "KeyD") keys.Right = false;
        if (e.code === "ArrowLeft" || e.code === "KeyA") keys.Left = false;
        if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") keys.Up = false;
    });

    // შეჯახების შემოწმება
    function checkCollision(player, obj) {
        return player.x < obj.x + obj.width &&
               player.x + player.width > obj.x &&
               player.y < obj.y + obj.height &&
               player.y + player.height > obj.y;
    }

    // მთავარი ციკლი
    function gameLoop() {
        // მოძრაობა
        if (keys.Right) panda.velocityX = panda.speed;
        else if (keys.Left) panda.velocityX = -panda.speed;
        else panda.velocityX = 0;

        // გრავიტაცია
        panda.velocityY += gravity;

        if (keys.Up && panda.grounded) {
            panda.velocityY = -panda.jumpForce;
            panda.grounded = false;
        }

        panda.x += panda.velocityX;
        panda.y += panda.velocityY;

        // საზღვრები
        if (panda.x < 0) panda.x = 0;
        if (panda.x + panda.width > canvas.width) panda.x = canvas.width - panda.width;

        // პლატფორმებთან შეჯახება
        panda.grounded = false;
        for (let plat of platforms) {
            if (checkCollision(panda, plat)) {
                if (panda.velocityY > 0 && (panda.y + panda.height - panda.velocityY) <= plat.y) {
                    panda.y = plat.y - panda.height;
                    panda.velocityY = 0;
                    panda.grounded = true;
                }
            }
        }

        // რენდერინგი (ხატვა)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // პლატფორმები
        for (let plat of platforms) {
            ctx.fillStyle = plat.color;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        }

        // დროებითი პანდა (შავი/თეთრი წრე, სანამ ფოტოს ჩავსვამთ)
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(panda.x + 22, panda.y + 22, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(panda.x + 12, panda.y + 15, 6, 0, Math.PI * 2);
        ctx.arc(panda.x + 32, panda.y + 15, 6, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}
