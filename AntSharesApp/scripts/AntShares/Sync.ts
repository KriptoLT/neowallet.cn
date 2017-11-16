﻿namespace AntShares
{
    export class Sync
    {
        private callNode(node: string): PromiseLike<Map<boolean, string>> {
            let dictionary = new Map<boolean, string>();
            let rpcClient = new AntShares.Network.RPC.RpcClient(node);
            return rpcClient.call("getblockcount", []).then(result => {
                dictionary.set(true, node);
                return Promise.resolve(dictionary);
            }, reject => {
                dictionary.set(false, node);
                return Promise.resolve(dictionary);
            });
        }

        public connectNode(isMainNet: boolean): void {
            debugLog("Connect");
            Promise.resolve(1).then(() => {
                let promises = [];
                let nodeList: string[] = new Array<string>();

                if (isMainNet) {
                    if (isMobileApp.App()) {
                        //MainNet App https&http
                        //nodeList = Global.mainHttpsNetList.concat(Global.mainHttpNetList);
                        nodeList = Global.mainHttpNetList;
                    } else {
                        //MainNet PC Web https
                        nodeList = Global.mainHttpsNetList;
                    }
                } else {
                    //TestNet
                    nodeList = Global.testNetList;
                }
                for (let i = 0; i < nodeList.length; i++) {
                    promises[i] = this.callNode(nodeList[i]);
                }
                return Promise.all(promises);
            }).then(results => {
                let node: string;
                for (let i = 0; i < results.length; i++) {
                    if ((<any>results[i]).has(true)) {
                        Global.isConnected = true;
                        node = (<any>results[i]).get(true);
                        break;
                    }
                }
                if (Global.isConnected) {
                    if (Global.RpcClient == null) {
                        Global.RpcClient = new Network.RPC.RpcClient(node);
                        Global.Blockchain = Core.Blockchain.registerBlockchain(new Implementations.Blockchains.RPC.RpcBlockchain(Global.RpcClient));
                        Global.Node = new Network.RemoteNode(Global.RpcClient);
                    } else {
                        //debugLog(Global.RpcClient.Url);
                        if (Global.RpcClient.Url != node) {
                            Global.RpcClient = new Network.RPC.RpcClient(node);
                            Global.Blockchain = Core.Blockchain.registerBlockchain(new Implementations.Blockchains.RPC.RpcBlockchain(Global.RpcClient));
                            Global.Node = new Network.RemoteNode(Global.RpcClient);
                        }
                    }
                } else {
                    throw new Error("网络连接中断");
                }
                }).then(success => {
                return Global.Blockchain.getBlockCount();
            }).then(result => {
            }).then(() => {
                setTimeout(this.connectNode.bind(Sync), AntShares.Core.Blockchain.SecondsPerBlock * 1000);
                //return delay(AntShares.Core.Blockchain.SecondsPerBlock * 1000).then(() => {
                //    return AntShares.Sync.connectNode(Global.isMainNet);
                //});
                //AntShares.Sync.connectNode(Global.isMainNet);
            }).catch(error => {
                debugLog("网络连接中断");
                setTimeout(this.connectNode.bind(Sync), Global.reConnectMultiplier * 1000);
                //return delay(Global.reConnectMultiplier * 1000).then(() => {
                //    return AntShares.Sync.connectNode(Global.isMainNet);
                //});
            });

        }

        public timer = () => {
            $("#countTimer").text(Global.count);
            Global.count++;
            setTimeout(this.timer.bind(Sync), 1000);
        }

    }

    //AntShares.Sync.connectNode(Global.isMainNet);
    //AntShares.Sync.timer();
    //AntShares.SyncHeight.processHeight();
    //AntShares.Sync.syncHeight();
}
