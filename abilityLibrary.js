const VERGIL_JUDGMENT_CUT_PHASES = {
    PREPARING: 'preparing',
    SLASHING: 'slashing',
    LINES: 'lines',
    SLIDE: 'slide',
    FALL: 'fall',
    SHEATHING: 'sheathing'
};

const JUDGMENT_CUT_CHARGE = {
    MIN_CHARGE_TIME: 1000,
    MAX_CHARGE_TIME: 3000,
};

const JUDGEMENT_CUT_CONSTANTS = {
    SLIDE_DURATION: 3000,
    SLIDE_SPEED: 1.2,
    FALL_INITIAL_VY: -8,
    FALL_VX_RANGE: 4,
    LINE_DISPLAY_DURATION: 800,
    FIRST_THREE_INTERVAL: 30,
    REMAINING_LINES_DELAY: 100
};

const AbilityLibrary = {
    judgementCut: function(character) {
        if (character.judgementCutCooldown > 0) return false;
        
        startCameraZoomEffect();
        
        const { cx, cy, zoom } = getCamera();
        const viewW = canvas.width / zoom;
        const viewH = canvas.height / zoom;
        
        if (!character.effectCanvas) {
            character.effectCanvas = document.createElement('canvas');
            character.effectCtx = character.effectCanvas.getContext('2d');
        }
        
        character.effectCanvas.width = viewW;
        character.effectCanvas.height = viewH;
        character.judgementCutCooldown = 120;
        
        character.judgementCutPhase = VERGIL_JUDGMENT_CUT_PHASES.PREPARING;
        character.slashAnimationFrame = 0;
        character.slashAnimationTimer = 0;
        
        const effect = {
            lines: [
                [0, viewH * 0.07, viewW, viewH * 0.82],
                [0, viewH * 0.29, viewW, viewH],
                [0, viewH * 0.52, viewW * 0.82, viewH],
                [0, viewH * 0.88, viewW, viewH * 0.8],
                [0, viewH * 0.92, viewW, viewH * 0.51],
                [viewW * 0.16, 0, viewW, viewH],
                [viewW * 0.22, 0, viewW, viewH * 0.73],
                [viewW * 0.3, 0, viewW, viewH * 0.48],
                [0, viewH * 0.2, viewW, viewH * 0.08],
                [0, viewH * 0.12, viewW, viewH * 0.45],
                [0, viewH * 0.55, viewW, viewH * 0.23],
                [0, viewH * 0.75, viewW, viewH * 0.19],
                [0, viewH * 0.2, viewW * 0.55, viewH],
                [0, viewH, viewW, viewH * 0.25],
                [viewW * 0.73, 0, viewW, viewH],
                [viewW, 0, viewW * 0.34, viewH],
                [viewW, 0, viewW * 0.03, viewH],
            ],
            phase: 'lines',
            damage: 35,
            range: 500,
            cameraX: cx - viewW / 2,
            cameraY: cy - viewH / 2,
            viewWidth: viewW,
            viewHeight: viewH,
            shards: [],
            visibleLines: 0,
            damageDealt: false,  
            caster: character    
        };
        
        character.judgementCutEffect = effect;
        
        // Lines appear one by one
        for (let i = 0; i < 7; i++) {
            setTimeout(() => {
                if (character.judgementCutEffect && character.judgementCutEffect.phase === 'lines') {
                    character.judgementCutEffect.visibleLines = i + 1;
                }
            }, i * JUDGEMENT_CUT_CONSTANTS.FIRST_THREE_INTERVAL);
        }
        
        // Remaining lines appear all at once after delay
        setTimeout(() => {
            if (character.judgementCutEffect && character.judgementCutEffect.phase === 'lines') {
                character.judgementCutEffect.visibleLines = effect.lines.length;
            }
        }, 3 * JUDGEMENT_CUT_CONSTANTS.FIRST_THREE_INTERVAL + JUDGEMENT_CUT_CONSTANTS.REMAINING_LINES_DELAY);
        
        // After lines display duration, hide lines and prepare shards
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.judgementCutEffect.phase = 'preparing';
                
                // Generate shards
                const helpers = {
                    lineSide: function(line, pt) {
                        const [x1,y1,x2,y2] = line;
                        return (x2-x1)*(pt[1]-y1)-(y2-y1)*(pt[0]-x1);
                    },
                    
                    segLineIntersection: function(a, b, line) {
                        const [x1,y1,x2,y2] = line;
                        const x3 = a[0], y3 = a[1], x4 = b[0], y4 = b[1];
                        const denom = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
                        if (Math.abs(denom)<1e-8) return null;
                        const px = ((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/denom;
                        const py = ((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/denom;
                        const between = (a,b,c) => a>=Math.min(b,c)-1e-6 && a<=Math.max(b,c)+1e-6;
                        if (between(px,a[0],b[0])&&between(py,a[1],b[1])) return [px,py];
                        return null;
                    },
                    
                    splitPolygonByLine: function(poly, line) {
                        let left=[], right=[];
                        for (let i=0;i<poly.length;++i) {
                            let a = poly[i], b = poly[(i+1)%poly.length];
                            let aside = this.lineSide(line, a);
                            let bside = this.lineSide(line, b);
                            if (aside >= 0) left.push(a);
                            if (aside <= 0) right.push(a);
                            if ((aside > 0 && bside < 0) || (aside < 0 && bside > 0)) {
                                let ipt = this.segLineIntersection(a, b, line);
                                if (ipt) { left.push(ipt); right.push(ipt); }
                            }
                        }
                        if (left.length>2) {
                            left = left.filter((p,i,arr)=>
                                i==0||Math.abs(p[0]-arr[i-1][0])>1e-5||Math.abs(p[1]-arr[i-1][1])>1e-5
                            );
                        } else left = null;
                        if (right.length>2) {
                            right = right.filter((p,i,arr)=>
                                i==0||Math.abs(p[0]-arr[i-1][0])>1e-5||Math.abs(p[1]-arr[i-1][1])>1e-5
                            );
                        } else right = null;
                        return [left, right];
                    },
                    
                    shatterPolygons: function(lines) {
                        let initial = [[ [0,0], [WIDTH,0], [WIDTH,HEIGHT], [0,HEIGHT] ]];
                        for (let line of lines) {
                            let next = [];
                            for (let poly of initial) {
                                let [left, right] = this.splitPolygonByLine(poly, line);
                                if (left) next.push(left);
                                if (right) next.push(right);
                            }
                            initial = next;
                        }
                        return initial;
                    }
                };
                
                const polys = helpers.shatterPolygons.call(helpers, effect.lines);
                character.judgementCutEffect.shards = polys.map(poly => {
                    let cx=0, cy=0;
                    for (let p of poly) { cx+=p[0]; cy+=p[1]; }
                    cx/=poly.length; cy/=poly.length;
                    
                    const expandedPoly = poly.map(point => {
                        const dx = point[0] - cx;
                        const dy = point[1] - cy;
                        const expandFactor = 1.1;
                        return [cx + dx * expandFactor, cy + dy * expandFactor];
                    });
                    
                    let dir = Math.random() < 0.5 ? -0.8 : 0.8;
                    return {
                        poly: expandedPoly,
                        x: (Math.random()-0.5) * 10,
                        y: (Math.random()-0.5) * 10,
                        vx: dir * (18 + Math.random()*10),
                        vy: (Math.random()-0.5)*10,
                        g: 1.10 + Math.random()*0.2,
                        angle: (Math.random()-0.5)*0.2,
                        vangle: (Math.random()-0.5)*0.12 + (cx-effect.viewWidth/2)*0.0003
                    };
                });
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION);
        
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.judgementCutPhase = VERGIL_JUDGMENT_CUT_PHASES.SHEATHING;
                character.isInvisibleDuringJudgmentCut = false;
                character.animState = "sheathing";
                character.animFrame = 0;
                character.animTimer = 0;
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 150);
        
        setTimeout(() => {
            if (character.judgementCutEffect) {
                character.judgementCutEffect.phase = 'slide';
                character.judgementCutEffect.startTime = performance.now();
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 300);
        
        setTimeout(() => {
            if (character.judgementCutPhase === VERGIL_JUDGMENT_CUT_PHASES.SHEATHING) {
                character.judgementCutPhase = null;
                character.animState = "idle";
                character.animFrame = 0;
                character.animTimer = 0;
            }
        }, JUDGEMENT_CUT_CONSTANTS.LINE_DISPLAY_DURATION + 1000);
        
        return true;
    },

    executeBeowulfUppercut: function(player, chargeTime) {
      player.beowulfCharging = false;
      player.beowulfChargeType = null;
      
      const maxChargeTime = 800;
      const chargeRatio = Math.min(chargeTime / maxChargeTime, 1.0);
      
      const minHeight = 10;
      const maxHeight = 18;
      const uppercutHeight = minHeight + (chargeRatio * (maxHeight - minHeight));
      
      player.vy = -uppercutHeight;
      player.vx = 0;
      player.dash = DASH_FRAMES;
      player.dashCooldown = DASH_COOLDOWN;
      
      player.isUppercutting = true;
      player.uppercutPower = chargeRatio;
      player.animState = "beowulf-uppercut";
      player.animFrame = 0;
      player.animTimer = 0;
      
      console.log(`${player.name} unleashes Rising Uppercut! Power: ${(chargeRatio * 100).toFixed(0)}% 👊⬆️💥`);
    },

    handleBeowulfDiveKick: function(player) {
      // Check if hit ground
      if (player.onGround && player.beowulfDiveKick) {
        player.beowulfDiveKick = false;
        player.isDiveKicking = false;
        
        // Add recovery state - player is vulnerable for a moment
        player.beowulfRecovering = true;
        player.beowulfRecoveryTimer = BEOWULF_DIVE_RECOVERY_TIME;
        player.animState = "beowulf-recovery";
        player.animFrame = 0;
        player.animTimer = 0;
        
        // Prevent movement during recovery
        player.vx = 0;
        player.vy = 0;
        
        console.log(`${player.name} is recovering from dive kick - vulnerable for 1.5 seconds! 🦆`);
        
        // Create explosion effect at impact point
        const impactX = player.x + player.w/2;
        const impactY = player.y + player.h;
        
        // Damage and knockup enemies in radius
        for (let i = 0; i < players.length; i++) {
          const opponent = players[i];
          if (opponent !== player && opponent.alive) {
            const dx = (opponent.x + opponent.w/2) - impactX;
            const dy = (opponent.y + opponent.h/2) - impactY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
             if (distance <= player.beowulfImpactRadius) {
              if (opponent.justHit === 0) {
                      let isBlocking = false;
                      if (opponent.blocking && opponent.block > 0 && !opponent.inHitstun) {
                        isBlocking = true;
                      }

                      if (isBlocking) {
                        const damage = 5;
                        opponent.hp -= damage;
                        opponent.justHit = 20;
                        opponent.hitstun = HITSTUN_FRAMES;
                        opponent.inHitstun = true;

                        const knockupForce = Math.max(2, 6 - (distance / player.beowulfImpactRadius) * 3);
                        opponent.vy = -knockupForce;
                        opponent.vx = (dx > 0 ? 1 : -1) * (knockupForce * 0.3);

                        createImpactEffect(player, opponent, 'block');
                        console.log(`${opponent.name} blocked ${player.name}'s dive kick explosion! 🛡️💥`);

                        if (opponent.hp <= 0) {
                          opponent.hp = 0;
                          opponent.alive = false;
                          winner = player.id;
                        }
                      } else {
                        const damage = 15;
                        opponent.hp -= damage;
                        opponent.justHit = 20;
                        opponent.hitstun = HITSTUN_FRAMES;
                        opponent.inHitstun = true;

                        if (!opponent.onGround) {
                          opponent.airHitstun = true;
                        } else {
                          opponent.airHitstun = false;
                        }

                        const knockupForce = Math.max(5, 12 - (distance / player.beowulfImpactRadius) * 7);
                        opponent.vy = -knockupForce;
                        opponent.vx = (dx > 0 ? 1 : -1) * (knockupForce * 0.5);

                        createImpactEffect(player, opponent, 'beowulf-dash');
                        console.log(`${player.name}'s Diagonal Dive Kick explosion hits ${opponent.name}! 💥⬆️`);

                        if (opponent.hp <= 0) {
                          opponent.hp = 0;
                          opponent.alive = false;
                          winner = player.id;
                        }
                        
                        // If we hit someone, reduce recovery time as reward
                        player.beowulfRecoveryTimer = Math.floor(BEOWULF_DIVE_RECOVERY_TIME * 0.6);
                        console.log(`${player.name} hit the target! Recovery time reduced! 🎯`);
                      }
              }
            }
          }
        }
        
        // Create explosion particles
        for (let i = 0; i < 12; i++) {
          particles.push({
            type: "explosion",
            x: impactX + (Math.random() - 0.5) * player.beowulfImpactRadius,
            y: impactY + (Math.random() - 0.5) * 30,
            life: 25,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * -5 - 2
          });
        }
      }
    },

    handleBeowulfUppercutHit: function(attacker, opponent) {
      if (attacker.isUppercutting && opponent.justHit === 0) {
        // CHECK FOR BLOCKING FIRST
        let isBlocking = false;
        if (opponent.blocking && opponent.block > 0 && !opponent.inHitstun) {
          if (opponent.facing === -Math.sign(attacker.vx || attacker.facing)) {
            isBlocking = true;
          }
        }
        
        if (isBlocking) {
          // Uppercut blocked - attacker gets stunned
          attacker.hitstun = HEAVY_HITSTUN_FRAMES; // Changed from HITSTUN_FRAMES
          attacker.inHitstun = true;
          attacker.vx = opponent.facing * BLOCK_PUSHBACK_X;
          attacker.vy = BLOCK_PUSHBACK_Y;
          attacker.isUppercutting = false;
          attacker.uppercutPower = 0;
          createImpactEffect(attacker, opponent, 'block');
          console.log(`${opponent.name} blocked ${attacker.name}'s Rising Uppercut! 🛡️👊`);
          return true;
        }
        
        // Normal uppercut hit logic continues...
        const damage = 12 + (attacker.uppercutPower * 8); // 12-20 damage based on charge
        opponent.hp -= damage;
        opponent.justHit = 20;
        
        // Set special uppercut hitstun that lasts until landing
        opponent.hitstun = 999999; // Very high number so it doesn't run out
        opponent.inHitstun = true;
        opponent.airHitstun = true; // This marks it as uppercut hitstun that only ends on landing
        
        console.log(`${opponent.name} was launched by uppercut and will remain stunned until landing!`);
        
        // Give opponent the SAME upward velocity as attacker
        opponent.vy = attacker.vy; // Exact same upward speed
        opponent.vx = attacker.facing * (6 + attacker.uppercutPower * 4); // Slight horizontal push
        
        createImpactEffect(attacker, opponent, 'beowulf-dash');
        
        if (opponent.hp <= 0) {
          opponent.hp = 0;
          opponent.alive = false;
          winner = attacker.id;
        }
        
        // End uppercut state
        attacker.isUppercutting = false;
        attacker.uppercutPower = 0;
        
        console.log(`${attacker.name}'s Rising Uppercut launches ${opponent.name} skyward! 👊⬆️💫`);
        return true;
      }
      return false;
    },

    handleMirageBladeAttack: function() {
      for (let i = 0; i < 2; i++) {
        const p = players[i];
        const opp = players[1 - i];
        if (!p.alive || !opp.alive || !p.mirageActive) continue;

        const slashW = 200, slashH = 100;
        const sx = p.mirageSlashX;
        const sy = p.mirageSlashY;

        if (sx < opp.x + opp.w && sx + slashW > opp.x &&
            sy < opp.y + opp.h && sy + slashH > opp.y) {
          opp.pauseTimer = 120;
          p.mirageActive = false;
          createImpactEffect(p, opp, 'dash');
          console.log(`${p.name}'s Mirage Blade slash freezes ${opp.name}! ❄️⏳`);
        }
      }
    },

    interruptJudgmentCut: function(player) {
      if (player.judgmentCutCharging) {
        player.judgmentCutCharging = false;
        player.judgmentCutChargeLevel = 0;
        player.animState = "hit";
        player.animFrame = 0;
        player.animTimer = 0;
        
        player.vx = (Math.random() - 0.5) * 4;
        player.vy = -3;
        
        for (let i = 0; i < 6; i++) {
          particles.push({
            type: "smoke",
            x: player.x + player.w/2 + (Math.random() - 0.5) * 20,
            y: player.y + player.h/2 + (Math.random() - 0.5) * 20,
            life: 15
          });
        }
        
        console.log(`${player.name}'s Judgment Cut was interrupted!`);
        return true;
      }
      return false;
    },

    isOpponentInJudgmentCutRange: function(caster) {
        for (let i = 0; i < players.length; i++) {
            const opponent = players[i];
            if (opponent !== caster && opponent.alive) {
                const dx = opponent.x + opponent.w/2 - (caster.x + caster.w/2);
                const dy = opponent.y + opponent.h/2 - (caster.y + caster.h/2);
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance <= JUDGMENT_CUT_TRIGGER_RANGE) {
                    return true;
                }
            }
        }
        return false;
    },

    dealJudgmentCutDamage: function(effect) {
        if (effect.damageDealt) return;
        
        const character = effect.caster;
        
        for (let i = 0; i < players.length; i++) {
            const opponent = players[i];
            if (opponent !== character && opponent.alive) {
                const dx = opponent.x - character.x;
                const dy = opponent.y - character.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < effect.range) {
                    const damageMultiplier = 1 - (distance / effect.range);
                    const damage = Math.round(effect.damage * damageMultiplier);
                    opponent.hp -= damage;
                    opponent.justHit = 20;
                    
                    const knockbackX = (opponent.x < character.x ? -1 : 1) * 15;
                    const knockbackY = -12;
                    knockback(character, opponent, knockbackX, knockbackY); // knockback is global
                    
                    if (opponent.hp <= 0) { 
                        opponent.hp = 0; 
                        opponent.alive = false; 
                        
                        if (character.hp <= 0) {
                            character.hp = 0;
                            character.alive = false;
                            winner = "draw";
                        } else {
                            winner = character.id; 
                        }
                    }
                }
            }
        }
        
        effect.damageDealt = true;
    }
};
// End of AbilityLibrary object

export { AbilityLibrary, VERGIL_JUDGMENT_CUT_PHASES, JUDGMENT_CUT_CHARGE, JUDGEMENT_CUT_CONSTANTS };