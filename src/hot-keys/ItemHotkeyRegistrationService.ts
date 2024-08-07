import store from '../globalState/vuex-store'
import { comboAsString } from "@/hot-keys/ItemHotkeys/utilsFunctions";
import {
    F1,
    F2,
    F3,
    ITEM_BOTTOM_LEFT,
    ITEM_BOTTOM_RIGHT,
    ITEM_MIDDLE_LEFT,
    ITEM_MIDDLE_RIGHT,
    ITEM_TOP_LEFT,
    ITEM_TOP_RIGHT
} from "@/hot-keys/ItemHotkeys/keyValuesHotKeys";
import logger from "@/logger";
import { ClickCombination, HotKey, HotkeyButtonPosition, ModifierKey } from "@/hot-keys/ItemHotkeys/hotkeyState";

const { globalShortcut } = window.require("electron").remote;
const keyboard = window.require("send-keys-native/build/Release/send-keys-native")
const Store = window.require("electron-store");

// this functions somehow could not be made private, on register/unregister the this. operator somehow gets fucked
const enterFunction = () => {
    globalShortcut.unregister("enter");
    keyboard.pressEnter();
    store.commit.hotKeys.HOTKEY_STATE_PRESS_ENTER();
    globalShortcut.register("enter", enterFunction);
}

const escapeFunction = () => {
    globalShortcut.unregister("escape");
    keyboard.pressEscape();
    store.commit.hotKeys.HOTKEY_STATE_PRESS_ESCAPE();
    globalShortcut.register("escape", escapeFunction);
}

const f10function = () => {
    globalShortcut.unregister("f10");
    keyboard.pressF10();
    store.commit.hotKeys.HOTKEY_STATE_PRESS_F10();
    globalShortcut.register("f10", f10function);
}

const f12function = () => {
    globalShortcut.unregister("f12");
    keyboard.pressF12();
    store.commit.hotKeys.HOTKEY_STATE_PRESS_F12();
    globalShortcut.register("f12", f12function);
}

export class ItemHotkeyRegistrationService {
    private keyValueStore = new Store();
    private lastPortKey = "lastPortKey";
    private hotKeyStoreKey = "hotKeyStoreKey"
    private hotKeyToggleKey = "hotKeyToggleKey"
    private hotKeyManualMode = "hotKeyManualModeKey"
    private hotKeyButtonPosition = "hotKeyButtonPosition"
    private keyShowHotkeyIndicator = "keyShowHotkeyIndicator"

    public saveManualMode(manualMode: boolean) {
        this.keyValueStore.set(this.hotKeyManualMode, manualMode);
    }

    public saveShowHotkeyIndicator(showIndicator: boolean) {
        this.keyValueStore.set(this.keyShowHotkeyIndicator, showIndicator);
    }

    public loadShowHotkeyIndicator(): boolean {
        const newVar = this.keyValueStore.get(this.keyShowHotkeyIndicator);
        if (newVar === undefined) {
            return false;
        }
        return newVar;
    }

    public loadHotkeyButtonPosition() {
        return this.keyValueStore.get(this.hotKeyButtonPosition);
    }

    public saveHotkeyButtonPosition(position: HotkeyButtonPosition) {
        logger.info(`saved hotkey x ${position.x}`);
        logger.info(`saved hotkey y ${position.y}`);
        return this.keyValueStore.set(this.hotKeyButtonPosition, position);
    }

    public loadManualMode() {
        return this.keyValueStore.get(this.hotKeyManualMode);
    }

    public saveHotKeys(hotKeys: HotKey[]) {
        this.keyValueStore.set(this.hotKeyStoreKey, hotKeys);
    }

    public loadHotKeys() {
        return this.keyValueStore.get(this.hotKeyStoreKey) ?? [];
    }

    public loadToggleKey() {
        return this.keyValueStore.get(this.hotKeyToggleKey);
    }

    public removeToggleOnOff(combo: ClickCombination) {
        try {
            globalShortcut.unregister(comboAsString(combo));
        } catch (e) {
            logger.error(`Failed to un-register combo: ${comboAsString(combo)}`);
        }
    }

    public toggleOnOff(combo: ClickCombination, fkt: () => void) {
        this.register(combo, fkt)

        this.keyValueStore.set(this.hotKeyToggleKey, combo)
    }

    public registerKey(hotKey: HotKey) {
        return this.register(hotKey.combo, () => {
            const modifier = hotKey.combo.modifier;
            if (modifier !== ModifierKey.None) {
                this.toggleModifierDown(hotKey.combo);
                this.pressCorrespondingKey(hotKey);
                this.toggleModifierUp(hotKey.combo);
            } else {
                this.pressCorrespondingKey(hotKey);
            }
        });
    }

    private pressCorrespondingKey(hotKey: HotKey) {
        switch (hotKey.key) {
            case F1 : {
                keyboard.pressF1();
                break;
            }
            case F2 : {
                keyboard.pressF2();
                break;
            }
            case F3 : {
                keyboard.pressF3();
                break;
            }
            case ITEM_TOP_LEFT : {
                keyboard.pressNum7();
                break;
            }
            case ITEM_MIDDLE_LEFT : {
                keyboard.pressNum4();
                break;
            }
            case ITEM_BOTTOM_LEFT : {
                keyboard.pressNum1();
                break;
            }
            case ITEM_TOP_RIGHT : {
                keyboard.pressNum8();
                break;
            }
            case ITEM_MIDDLE_RIGHT : {
                keyboard.pressNum5();
                break;
            }
            case ITEM_BOTTOM_RIGHT : {
                keyboard.pressNum2();
                break;
            }
        }
    }

    public unregister(combo: ClickCombination) {
        const keyCode = comboAsString(combo);
        globalShortcut.unregister(keyCode)
    }

    public saveLastW3cPort(port: string) {
        this.keyValueStore.set(this.lastPortKey, port);
    }

    public loadLastW3cPort() {
        return this.keyValueStore.get(this.lastPortKey);
    }

    private register(combo: ClickCombination, fkt: () => void) {
        try {
            const keyCode = comboAsString(combo);
            if (globalShortcut.isRegistered(keyCode)) {
                globalShortcut.unregister(keyCode)
            }

            globalShortcut.register(keyCode, fkt)
        } catch (e) {
            logger.error(`Failed to register combo: ${comboAsString(combo)}`);
        }
    }

    public disableHotKeys(hotKeys: HotKey[]) {
        globalShortcut.unregister("enter");
        globalShortcut.unregister("escape");
        globalShortcut.unregister("f10");
        globalShortcut.unregister("f12");
        hotKeys.forEach(h => globalShortcut.unregister(comboAsString(h.combo)));
    }

    public enableHotKeys(hotKeys: HotKey[]) {
        this.enableChatCommands();
        hotKeys.forEach(h => this.registerKey(h));
    }

    private enableChatCommands() {
        this.register({modifier: ModifierKey.None, hotKey: {key: "enter", uiDisplay: "enter"}}, enterFunction)
        this.register({modifier: ModifierKey.None, hotKey: {key: "escape", uiDisplay: "escape"}}, escapeFunction)
        this.register({modifier: ModifierKey.None, hotKey: {key: "f10", uiDisplay: "f10"}}, f10function)
        this.register({modifier: ModifierKey.None, hotKey: {key: "f12", uiDisplay: "f12"}}, f12function)
    }

    private toggleModifierDown(combo: ClickCombination) {
        switch (combo.modifier) {
            case ModifierKey.Ctrl: {
                keyboard.releaseCtrl();
                break;
            }
            case ModifierKey.Alt: {
                keyboard.releaseAlt();
                break;
            }
            case ModifierKey.Shift: {
                keyboard.releaseShift();
                break;
            }
            case ModifierKey.Cmd: {
                keyboard.releaseCmd();
                break;
            }
        }
    }

    private toggleModifierUp(combo: ClickCombination) {
        switch (combo.modifier) {
            case ModifierKey.Ctrl: {
                keyboard.holdCtrl();
                break;
            }
            case ModifierKey.Alt: {
                keyboard.holdAlt();
                break;
            }

            case ModifierKey.Shift: {
                keyboard.holdShift();
                break;
            }
            case ModifierKey.Cmd: {
                keyboard.holdCmd();
                break;
            }
        }
    }

    get isWindows() {
        return store.state.isWindows;
    }
}

