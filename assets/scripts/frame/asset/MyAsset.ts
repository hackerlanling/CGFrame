import { Asset, assetManager, error, log } from "cc";
import { AudioClip } from "cc";
import { Prefab } from "cc";
import { SpriteFrame } from "cc";
import { Texture2D } from "cc";
import { sp } from "cc";
import { AssetManager } from "cc";

export default class MyAsset {
    public assetsInfo = {};

    /**定时清理冷资源 （秒） */
    private readonly clearTime = 50;

    constructor() {
        XF.main.schedule(() => {
            this._autoRef();
        }, this.clearTime);
    }

    /**
     * 静默预加载（用于游戏中静默预加载资源，用的时候需要谨慎，避免乱用之后下载一堆无用资源，又不会去load使用）
     * @param bundleName
     * @param dir 需要预加载的资源
     * @param onProgress
     * @param onComplete
     */
    public preLoadRes(bundleName: string, dir: string = "", onProgress: (finish: number, total: number, item: AssetManager.RequestItem) => void = null, onComplete: (error: Error, items: AssetManager.RequestItem[]) => void = null) {
        this.loadBundle(bundleName, (err, bundle) => {
            bundle.preloadDir(dir, onProgress, function (err: Error, items: any[]) {
                if (err) {
                    error("Bundle预加载异常:", err);
                }
                onComplete && onComplete(err, items);
            });
        });
    }

    /**
     * 加载整个bundle或者文件资源，一般用于进入游戏前，需要加载某些必要的预制体或者资源
     * 这里要注意：因为加载的资源，都没有走我们自己额assetsInfo机制，所以也不存在自动释放。所以如果加载一些非必要的资源，后续又没有去show出来，那么会一直存在在内存中。
     * 用的时候一定要在逻辑层考虑这个东西，是不是非必要的，后续有没有可能不被玩家show出来
     * @param bundleName
     * @param dir
     * @param onProgress
     * @param onComplete
     */
    public async loadDirRes(bundleName: string, dir: string = "", onProgress: (finish: number, total: number, item: AssetManager.RequestItem) => void, onComplete: (err: Error, data: any[]) => void = null): Promise<AssetManager.Bundle> {
        return new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err, bundle) => {
                bundle.loadDir(
                    dir,
                    (finish: number, total: number, item: AssetManager.RequestItem) => {
                        onProgress(finish, total, item);
                    },
                    function (err: Error, items: any[]) {
                        if (err) {
                            error("Bundle预加载异常:", err);
                            return reject(null);
                        }
                        if (onComplete) {
                            onComplete(err, items);
                        }
                        return resolve(null);
                    }
                );
            });
        });
    }

    public loadBundle(bundleName, callback) {
        if (assetManager.getBundle(bundleName)) {
            callback && callback(null, assetManager.getBundle(bundleName));
            return;
        }
        //loadBundle虽然不会重复加载，但是回调逻辑是在下一帧执行的，会导致不够及时
        assetManager.loadBundle(bundleName, (err, bundle) => {
            callback && callback(err, bundle);
        });
    }

    /*
    eg：await MyAsset.getAsset("bundleName","path") as Prefab;
    */
    /**
     * 从AB包中加载一个资源
     * @param bundleName AB包名
     * @param path 资源路径
     * @param assetTag 资源标签
     * @param assetType 资源类型
     * @returns Promise对象，值为Asset
     */
    public async getAsset(bundleName: string, path: string, assetTag?: string, assetType?: typeof Asset) {
        return new Promise(async (resolve, reject) => {
            //记录资源索引
            if (!assetType) assetType = Asset;

            if ((assetType as any) === SpriteFrame) {
                path += "/spriteFrame";
            } else if ((assetType as any) === Texture2D) {
                path += "/texture";
            }

            let pathID = `${bundleName}_${path}_${assetType.name}`;
            if (!assetTag) {
                assetTag = pathID;
            }

            if (!this.assetsInfo[pathID]) {
                this.assetsInfo[pathID] = {};
            }

            if (this.assetsInfo[pathID]?.asset?.isValid) {
                let asset = this.assetsInfo[pathID].asset;
                if (!this.assetsInfo[pathID].tag[assetTag]) {
                    //如果这个tag没存在过，则增加引用计数
                    asset.addRef();
                }

                this.assetsInfo[pathID].tag[assetTag] = 1;
                resolve && resolve(asset);
                return;
            }

            this.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    console.warn("加载Bundle错误", bundleName, err);
                    // reject && reject();
                    return;
                }
                bundle.load(path, assetType, (err, asset) => {
                    if (err) {
                        console.warn("从bundle中读取资源错误", path, err);
                        // reject && reject();
                        return;
                    }
                    asset.addRef();
                    //记录资源索引以及最后访问时间
                    var tag = {};
                    tag[assetTag] = 1;
                    this.assetsInfo[pathID] = {
                        asset: asset,
                        lastGetTime: new Date().getTime(),
                        tag: tag,
                    };
                    //默认计数为+1，避免releaseUnusedAssets时被释放，通过_autoRef里来释放
                    asset.addRef();
                    resolve && resolve(asset);
                });
            });
        });
    }

    public ifAssetLoaded(bundleName: string, path: string, assetTag?: string): boolean {
        let pathID = `${bundleName}_${path}_${Prefab.name}`;
        if (!assetTag) {
            assetTag = pathID;
        }

        return !!this.assetsInfo[pathID];
    }
    /**
     * 从AB包中加载AudioClip
     * @param path 资源路径
     * @param bundleName AB包名，可选，默认为 audio
     * @param assetTag 资源标签，可选，默认为 GameAudio
     * @returns
     */
    public async getAudio(path: string, bundleName: string = "audio", assetTag: string = "GameAudio"): Promise<AudioClip> {
        return this.getAsset(bundleName, path, assetTag, AudioClip) as any;
    }
    /**
     * 从AB包中加载Prefab
     * @param bundleName AB包名
     * @param path 资源路径
     * @param assetTag 资源标签
     * @returns Prefab
     */
    public async getPrefab(bundleName: string = "ui", path: string, assetTag?: string): Promise<Prefab> {
        return this.getAsset(bundleName, path, assetTag, Prefab) as any;
    }
    /**
     * 从AB包中加载SpriteFrame
     * @param bundleName AB包名
     * @param path 资源路径
     * @param assetTag 资源标签
     * @returns SpriteFrame
     */
    public async getSpriteFrame(bundleName: string = "ui", path: string, assetTag?: string): Promise<SpriteFrame> {
        return this.getAsset(bundleName, path, assetTag, SpriteFrame) as any;
    }

    /**
     * 从AB包中加载Texture2D
     * @param bundleName AB包名
     * @param path 资源路径
     * @param assetTag 资源标签
     * @returns Texture2D
     */
    public async getTexture(bundleName: string = "ui", path: string, assetTag?: string): Promise<Texture2D> {
        return this.getAsset(bundleName, path, assetTag, Texture2D) as any;
    }

    /**
     * 从AB包中加载SkeletonData
     * @param bundleName AB包名
     * @param path 资源路径
     * @param assetTag 资源标签
     * @returns SkeletonData
     */
    public async getSkeletonData(bundleName: string = "ui", path: string, assetTag?: string): Promise<sp.SkeletonData> {
        return this.getAsset(bundleName, path, assetTag, sp.SkeletonData) as any;
    }

    /**
     * 释放资源，框架内部方法
     * @param assetTag 资源标签
     */
    public decRefByTag(assetTag: string) {
        var asset, lastGetTime;
        log("减少资源计数索引=>", assetTag);
        for (var path in this.assetsInfo) {
            asset = this.assetsInfo[path]?.asset;
            if (asset?.isValid && this.assetsInfo[path]?.tag[assetTag]) {
                asset.decRef();
                delete this.assetsInfo[path]?.tag[assetTag];
            }
            //更新最后访问时间，避免decRef后，立刻被_autoRef回收
            this.assetsInfo[path].lastGetTime = new Date().getTime();
        }
    }

    //自动释放资源
    public _autoRef() {
        var now = new Date().getTime();
        log("自动释放资源检测", now);
        var asset, lastGetTime;
        for (var path in this.assetsInfo) {
            asset = this.assetsInfo[path].asset;
            lastGetTime = this.assetsInfo[path].lastGetTime;

            //引用计数为1，则说明只有MyAsset自身持有了，游戏逻辑本身已经不需要，指定时间没访问过的冷资源，则释放掉
            if (now - lastGetTime > 5 * 60 * 1000) {
                if (asset == undefined) {
                    delete this.assetsInfo[path];
                } else if (!asset.isValid) {
                    log("释放资源==>", asset);
                    delete this.assetsInfo[path];
                } else if (asset.isValid && asset.refCount <= 1) {
                    log("释放资源==>", asset);
                    asset.decRef();
                    delete this.assetsInfo[path];
                }
            }
        }
    }
}