﻿namespace AntShares.UI.Contract
{
    export class CreateMultiSig extends TabBase
    {
        protected oncreate(): void
        {
            $(this.target).find("#add_public").click(this.OnAddPublicKeyButtonClick);
            $(this.target).find("#create_multisig_contract").click(this.OnCreateButtonClick);
        }

        protected onload(args: any[]): void
        {
        }

        private OnCreateButtonClick = () =>
        {
            if (formIsValid("form_create_multisig"))
            {
                let publicKeys = new Array<AntShares.Cryptography.ECPoint>();
                let _m = $("#input_m").val();
                let m: number = Number(_m.split(",").join(""));
                let promises = new Array<PromiseLike<Uint160>>();
                try
                {
                    let publicItems = $(".publickeyitem");
                    for (let i = 0; i < publicItems.length; i++)
                    {
                        if ($(publicItems[i]).val() != "")
                        {
                            let publickey: string = $(publicItems[i]).val();
                            if (typeof publickey === "string") {
                                publicKeys.push(AntShares.Cryptography.ECPoint.decodePoint(publickey.hexToBytes(), AntShares.Cryptography.ECCurve.secp256r1));
                            }
                        }
                    }
                    for (let i = 0; i < publicKeys.length; i++)
                    {
                        promises.push(publicKeys[i].encodePoint(true).toScriptHash());
                    }
                } catch (e)
                {
                    alert(e);
                }

                Promise.all(promises).then(results =>
                {
                    for (let i = 0; i < results.length; i++)
                        if (Global.Wallet.containsAccount(results[i]))
                            return results[i];
                    throw new Error();
                }).then(result =>
                {
                    return Wallets.Contract.createMultiSigContract(result, m, publicKeys);
                }).then(result =>
                {
                    return Global.Wallet.addContract(result);
                }).then(() =>
                {
                    $("#Tab_Contract_CreateMultiSig .add_new").remove();
                    formReset("form_create_multisig");
                    alert(Resources.global.createMultiContractSuccess);
                    //创建成功后跳转到合约管理页面
                    TabBase.showTab("#Tab_Contract_Index");
                }).catch(reason =>
                {
                    alert(reason);
                });
            }
        }

        private removeInput(parent, divId) {
            parent.find("#" + divId).remove();
        }

        private OnAddPublicKeyButtonClick = () =>
        {
            let parent = $("#Tab_Contract_CreateMultiSig #div_publickeys");

            let inputElement = $("#Tab_Contract_CreateMultiSig #public_tpl").clone(true);
            inputElement.show();
            inputElement.addClass("add_new");
            inputElement.removeAttr("id");

            parent.append(inputElement); 
        }

    }
}
