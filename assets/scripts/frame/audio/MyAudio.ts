import { AudioClip, AudioSource, Node, director, log } from "cc";
import InstanceBase from "../base/InstanceBase";

export default class MyAudio extends InstanceBase {
    //音乐音量
    private _musicVolume = 1;
    //音效音量
    private _effectVolume = 0.5;
    //音效是否开启
    private _isEffectOn = true;
    //音乐是否开启
    private _isMusicOn = true;
    //当前背景音乐url
    private _curMusicUrl = "";
    //当前音效id
    private _curEffectId = -1;
    private _curLoop: boolean = true;

    private _musicAudioSource: AudioSource;
    private _effectAudioSource: AudioSource;

    private readonly _storeMusicKey: string = "default_save_music";
    private readonly _storeEffectKey: string = "default_save_effect";
    private readonly _storeMusicVolumeKey: string = "default_save_music_volume_key";
    private readonly _storeEffectVolumeKey: string = "default_save_effect_volume_key";

    constructor() {
        super();
        let audioMgr = new Node();
        audioMgr.name = "__MyAudioMgr__";
        director.getScene().addChild(audioMgr);
        //标记为常驻节点，场景切换的时候不销毁
        director.addPersistRootNode(audioMgr);
        this._musicAudioSource = audioMgr.addComponent(AudioSource);
        this._effectAudioSource = audioMgr.addComponent(AudioSource);

        //音量开关读取
        var _val = XF.cache.get(this._storeMusicKey, "system");
        this._isMusicOn = _val != undefined ? _val : this._isMusicOn;

        var _val = XF.cache.get(this._storeEffectKey, "system");
        this._isEffectOn = _val != undefined ? _val : this._isEffectOn;

        //音量读取
        var _val = XF.cache.get(this._storeMusicVolumeKey, "system");
        this._musicVolume = _val != undefined ? _val : this._musicVolume;

        var _val = XF.cache.get(this._storeEffectVolumeKey, "system");
        this._effectVolume = _val != undefined ? _val : this._effectVolume;
    }

    public save() {
        try {
            XF.cache.set(this._storeMusicKey, this.isMusicOn, 0, "system");
            XF.cache.set(this._storeMusicVolumeKey, this.musicVolume, 0, "system");
            XF.cache.set(this._storeEffectKey, this.isEffectOn, 0, "system");
            XF.cache.set(this._storeEffectVolumeKey, this.effectVolume, 0, "system");
        } catch (error) { }
    }

    /**
     * 背景音乐音量
     */
    public get musicVolume() {
        return this._musicVolume;
    }
    public set musicVolume(volume) {
        this._musicAudioSource.volume = volume;
        if (volume <= 0) {
            this.stopMusic();
        }
        this._musicVolume = volume;
    }
    /**
     * 音效音量
     */
    public get effectVolume() {
        return this._effectVolume;
    }
    public set effectVolume(volume) {
        this._effectAudioSource.volume = volume;
        if (volume <= 0) {
            this.stopAllEffects();
        }
        this._effectVolume = volume;
    }

    /**
     * 音效开关
     */
    public get isEffectOn() {
        return this._isEffectOn;
    }
    public set isEffectOn(value) {
        this._isEffectOn = value;
        if (!value) {
            this.stopAllEffects();
        }
    }

    /**
     * 背景音乐开关
     */
    public get isMusicOn() {
        return this._isMusicOn;
    }
    public set isMusicOn(isOn: boolean) {
        this._isMusicOn = isOn;
        if (this._isMusicOn) {
            if (!this.curMusicUrl) {
                return;
            }
        } else {
            this.stopMusic();
        }
    }
    /**
     * 当前播放的背景音乐
     */
    public get curMusicUrl() {
        return this._curMusicUrl;
    }
    public set curMusicUrl(value) {
        this._curMusicUrl = value;
    }
    /**
     * 当前播放的背景音乐循环状态
     */
    protected get curLoop() {
        return this._curLoop;
    }
    protected set curLoop(value) {
        this._curLoop = value;
    }

    /**
     * 停止所有音效
     */
    public stopAllEffects() {
        this._effectAudioSource.stop();
    }

    /**
     * 停止背景音乐
     */
    public stopMusic() {
        this._musicAudioSource.stop();
    }

    /**
     * 播放背景音乐
     * @param url 音乐地址
     * @param loop 是否循环
     */
    public async playMusic(url: string, loop: boolean = true) {
        var audio = await XF.asset.getAudio(url);
        this.curMusicUrl = url;
        this.curLoop = loop;

        if (this.isMusicOn) {
            //停掉当前播放音乐
            this.stopMusic();
            //播放新的背景音乐
            this._musicAudioSource.clip = audio;
            this._musicAudioSource.play();
            this._musicAudioSource.loop = loop;
            this._musicAudioSource.volume = this.musicVolume;
        }
    }

    /**
     * 播放音效
     * @param url 音效地址
     */
    public async playEffect(url: string) {
        var audio = await XF.asset.getAudio(url);
        this._effectAudioSource.playOneShot(audio, this.effectVolume);
    }
}
