import store from '../../globalState/vuex-store'
import logger from "@/logger";

export abstract class HotKeyState {
    abstract enterGame(): HotKeyState;
    abstract exitGame(): HotKeyState;
    abstract pressEnter(): HotKeyState;
    abstract pressEscape(): HotKeyState;
    abstract pressF10(): HotKeyState;
    abstract pressF12(): HotKeyState;
    abstract toggleManualMode(): HotKeyState;
    abstract toggle(): HotKeyState;
    abstract isManual(): boolean;
    abstract isTurnedOn(): boolean;

    protected turnOffHotkeys() {
        logger.info("turn Off HotKeys manually")

        if (!store.state.isWindows) {
            const audio = new Audio('/sound/PeonDeath.mp3');
            audio.currentTime = 0;
            audio.volume = 0.5;
            audio.play();
        }

        return new NotInGameState();
    }

    protected turnOnHotKeys() {
        logger.info("turn on HotKeys manually")

        if (!store.state.isWindows) {
            const audio = new Audio('/sound/PeonReady1.mp3');
            audio.currentTime = 0.3;
            audio.volume = 0.5;
            audio.play();
        }

        return new InGameState();
    }
}

export class ChatState extends HotKeyState {
    constructor() {
        super();
        store.dispatch.hotKeys.disableHotKeys();
    }

    enterGame(): HotKeyState {
        return new InGameState();
    }

    exitGame(): HotKeyState {
        return new NotInGameState();
    }

    pressEnter(): HotKeyState {
        return new InGameState();
    }

    pressEscape(): HotKeyState {
        return new InGameState();
    }

    pressF10(): HotKeyState {
        return this;
    }

    pressF12(): HotKeyState {
        return this;
    }

    toggleManualMode(): HotKeyState {
        return new ManualHotkeyMode();
    }

    toggle(): HotKeyState {
        return this.turnOnHotKeys();
    }

    isManual(): boolean {
        return false;
    }

    isTurnedOn(): boolean {
        return false;
    }
}

export class ManualHotkeyMode extends HotKeyState {
    constructor() {
        super();
        store.dispatch.hotKeys.disableHotKeys();
    }

    public keysActivatedInManualMode = false;

    enterGame(): HotKeyState {
        return this;
    }

    exitGame(): HotKeyState {
        return this;
    }

    pressEnter(): HotKeyState {
        return this;
    }

    pressEscape(): HotKeyState {
        return this;
    }

    pressF10(): HotKeyState {
        return this;
    }

    pressF12(): HotKeyState {
        return this;
    }

    toggleManualMode(): HotKeyState {
        return new NotInGameState();
    }

    toggle(): HotKeyState {
        if (this.keysActivatedInManualMode) {
            this.turnOffHotkeys()
            this.keysActivatedInManualMode = false;
        } else {
            this.turnOnHotKeys();
            this.keysActivatedInManualMode = true;
        }

        return this;
    }

    isManual(): boolean {
        return true;
    }

    isTurnedOn(): boolean {
        return this.keysActivatedInManualMode;
    }
}

class MenuState extends HotKeyState {
    isTurnedOn(): boolean {
        throw new Error('Method not implemented.');
    }
    constructor() {
        super();
        store.dispatch.hotKeys.disableHotKeys();
    }

    enterGame(): HotKeyState {
        return new InGameState();
    }

    exitGame(): HotKeyState {
        return new NotInGameState();
    }

    pressEnter(): HotKeyState {
        return this;
    }

    pressEscape(): HotKeyState {
        return new InGameState();
    }

    pressF10(): HotKeyState {
        return new InGameState();
    }

    pressF12(): HotKeyState {
        return this;
    }

    toggleManualMode(): HotKeyState {
        return new ManualHotkeyMode();
    }

    toggle(): HotKeyState {
        return this.turnOnHotKeys();
    }

    isManual(): boolean {
        return false;
    }
}

class InChatLogState extends HotKeyState {
    constructor() {
        super();
        store.dispatch.hotKeys.disableHotKeys();
    }

    enterGame(): HotKeyState {
        return new InGameState();
    }

    exitGame(): HotKeyState {
        return new NotInGameState();
    }

    pressEnter(): HotKeyState {
        return new InGameState();
    }

    pressEscape(): HotKeyState {
        return new InGameState();
    }

    pressF10(): HotKeyState {
        return this;
    }

    pressF12(): HotKeyState {
        return new InGameState();
    }

    toggleManualMode(): HotKeyState {
        return new ManualHotkeyMode();
    }

    toggle(): HotKeyState {
        return this.turnOnHotKeys();
    }

    isManual(): boolean {
        return false;
    }

    isTurnedOn(): boolean {
        return false;
    }
}

export class InGameState extends HotKeyState {
    constructor() {
        super();
        store.dispatch.hotKeys.enableHotKeys();
    }

    enterGame(): HotKeyState {
        return this;
    }

    exitGame(): HotKeyState {
        return new NotInGameState();
    }

    pressEnter(): HotKeyState {
        return new ChatState();
    }

    pressEscape(): HotKeyState {
        return this;
    }

    pressF10(): HotKeyState {
        return new MenuState();
    }

    pressF12(): HotKeyState {
        return new InChatLogState();
    }

    toggleManualMode(): HotKeyState {
        return new ManualHotkeyMode();
    }

    toggle(): HotKeyState {
        return this.turnOffHotkeys();
    }

    isManual(): boolean {
        return false;
    }

    isTurnedOn(): boolean {
        return true;
    }
}

export class NotInGameState extends HotKeyState {
    constructor() {
        super();
        if (store) {
            store.dispatch.hotKeys.disableHotKeys();
        }
    }

    enterGame(): HotKeyState {
        return new InGameState();
    }

    exitGame(): HotKeyState {
        return this;
    }

    pressEnter(): HotKeyState {
        return this;
    }

    pressEscape(): HotKeyState {
        return this;
    }

    pressF10(): HotKeyState {
        return this;
    }

    pressF12(): HotKeyState {
        return this;
    }

    toggleManualMode(): HotKeyState {
        return new ManualHotkeyMode();
    }

    toggle(): HotKeyState {
        return this.turnOnHotKeys();
    }

    isManual(): boolean {
        return false;
    }

    isTurnedOn(): boolean {
        return false;
    }
}

