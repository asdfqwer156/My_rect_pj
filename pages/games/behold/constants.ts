
export const GAME_WIDTH = 820;
export const GAME_HEIGHT = 615;
export const NUM_PEEPS = 18;
export const PEEP_SIZE = 48;
export const CAMERA_SIZE = 200;
export const PEEP_SPEED = 1;
export const ANGRY_PEEP_SPEED = 2;

export const TV_WIDTH = 240;
export const TV_HEIGHT = (TV_WIDTH * 9) / 16;
export const TV_STAND_HEIGHT = 48;
export const TV_ANTENNA_HEIGHT = 16;
export const TV_TOTAL_HEIGHT = TV_HEIGHT + TV_STAND_HEIGHT + TV_ANTENNA_HEIGHT;

export const TV_COLLISION_BOX = {
    x: (GAME_WIDTH - TV_WIDTH) / 2,
    y: (GAME_HEIGHT - TV_TOTAL_HEIGHT) / 2,
    width: TV_WIDTH,
    height: TV_TOTAL_HEIGHT,
};