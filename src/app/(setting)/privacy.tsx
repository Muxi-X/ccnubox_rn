import { ScrollView, StyleSheet, View } from 'react-native';

import { TypoText } from '@/components/typography';

export default function Privacy() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <TypoText level={1}>隐私政策</TypoText>

        <TypoText style={styles.metaInfo}>
          发布及生效时间：2025年9月1日{'\n'}
          更新时间：2025年9月5日{'\n'}
          公司名称：择木而樨（武汉）网络技术有限公司{'\n'}
          注册地址/常用办公联系地址：湖北省武汉市洪山区珞南街道珞喻路152号华中师范大学老图书馆附楼中科创业园C101-2号
        </TypoText>

        <TypoText>
          本政策仅适用于择木而樨（武汉）网络技术有限公司提供的产品和服务及其延伸的功能（以下简称"华师匣子"）。如我们提供的某款产品有单独的隐私政策或相应的用户服务协议当中存在特殊约定，则该产品的隐私政策将优先适用；该款产品隐私政策和用户服务协议未涵盖的内容，以本政策内容为准。除本隐私权政策另有规定外，在未征得您事先许可的情况下，本系统不会将这些信息对外披露或向第三方提供。本系统会不时更新本隐私权政策。您在同意本系统服务使用协议之时，即视为您已经同意本隐私权政策全部内容。本隐私权政策属于本系统服务使用协议不可分割的一部分。
        </TypoText>

        <TypoText>
          本政策适用于"华师匣子"提供的所有产品和服务。在您使用"华师匣子"各项产品或者服务前，请您务必仔细阅读并透彻理解本政策，特别是以粗体/粗体下划线标识的条款，您应重点阅读，确保您充分理解和同意后再开始使用。本政策中涉及的专业词汇，我司尽量以简明通俗的表述向您解释，以便于您理解。
        </TypoText>

        <TypoText level={2}>本隐私政策将帮助您了解以下内容</TypoText>
        <TypoText>一、定义及适用范围</TypoText>
        <TypoText>二、我司如何收集和使用您的个人信息</TypoText>
        <TypoText>三、我司如何使用Cookie和同类技术</TypoText>
        <TypoText>四、我司如何共享、转让、公开披露您的信息</TypoText>
        <TypoText>五、我司如何保护、存储您的信息</TypoText>
        <TypoText>六、如何访问和管理自己的信息、信息安全</TypoText>
        <TypoText>七、其他</TypoText>

        <TypoText level={2}>一、适用范围</TypoText>

        <TypoText level={3}>
          1. 在您登陆本系统帐号时，您根据本系统要求提供的登陆信息
        </TypoText>

        <TypoText level={3}>
          2.
          在您使用本系统网络服务，或访问本系统平台网页时，本系统自动接收并记录的您的浏览器和计算机上的信息，包括但不限于您的IP地址、浏览器的类型、使用的语言、访问日期和时间、软硬件特征信息及您需求的网页记录等数据
        </TypoText>

        <TypoText level={3}>
          3. 本系统通过合法途径从商业伙伴处取得的用户个人数据
        </TypoText>

        <TypoText level={3}>
          4. 位置信息：您使用位置服务时，我们需要收集和处理您的位置信息
        </TypoText>

        <TypoText level={3}>
          5.
          设备信息：为了保证服务的正常运行，向您提供问题诊断或设备检测服务，我们会收集您的硬件型号、操作系统版本、设备配置、唯一设备标识符、网络设备硬件地址MAC、设备连接信息以及设备状态信息等。基于不同的系统，设备信息表述文字有所不同
        </TypoText>

        <TypoText level={3}>6. 设备权限收集说明：</TypoText>
        <TypoText>
          {' '}
          1.
          存储权限(读写存储):为了存储必要的应用配置文件以及您所选择下载、更新的内容、报表，或读取您需要上传、同步的内容，需要调用您的存储权限
        </TypoText>
        <TypoText> 2. 网络连接：用于与服务器建立连接以获取数据</TypoText>
        <TypoText>
          {' '}
          3.
          相册权限：当您使用保存课表功能时，我们需要调用您的相册获取图片权限填写
        </TypoText>

        <TypoText level={3}>
          您了解并同意，以下信息不适用本隐私权政策：
        </TypoText>
        <TypoText>
          1.
          日志信息：与您使用某些功能、应用和网站相关的信息。例如Cookie和其他标识符技术、网络请求信息、标准系统日志、错误崩溃信息、使用服务产生的日志信息（如访问时间、活动时间等）
        </TypoText>
        <TypoText>
          2. 违反法律规定或违反本系统规则行为及本系统已对您采取的措施
        </TypoText>

        <TypoText level={2}>二、信息使用</TypoText>

        <TypoText level={3}>
          1.
          本系统不会向任何无关第三方提供、出售、出租、分享或交易您的个人信息，除非事先得到您的许可，或该第三方和本系统（含本系统关联公司）单独或共同为您提供服务，且在该服务结束后，其将被禁止访问包括其以前能够访问的所有这些资料
        </TypoText>

        <TypoText level={3}>
          2.
          本系统亦不允许任何第三方以任何手段收集、编辑、出售或者无偿传播您的个人信息。任何本系统平台用户如从事上述活动，一经发现，本系统有权立即终止与该用户的服务协议
        </TypoText>

        <TypoText level={3}>
          3.
          为服务用户的目的，本系统可能通过使用您的个人信息，向您提供信息，包括但不限于向您发出产品和服务信息，或者与本系统合作伙伴共享信息以便他们向您发送有关其产品和服务的信息（后者需要您的事先同意）
        </TypoText>

        <TypoText level={3}>
          4.
          为了向用户提供更好的服务或产品，本系统可能会在下述情形使用用户的个人信息：
        </TypoText>
        <TypoText> 1. 根据相关法律法规的要求</TypoText>
        <TypoText> 2. 根据用户的授权</TypoText>
        <TypoText> 3. 根据本系统相关服务条款、应用许可使用协议的约定</TypoText>

        <TypoText level={3}>
          5.
          为您提供信息或服务，向您发送最新资讯内容。若您拒绝或关闭设备信息后，我们向您推送的信息会降低精准度或相关度，但不影响您正常使用其他不需要该权限的功能
        </TypoText>

        <TypoText level={2}>三、Cookie的使用</TypoText>

        <TypoText level={3}>
          1.
          在您未拒绝接受cookies的情况下，本系统会在您的计算机上设定或取用cookies，以便您能登录或使用依赖于cookies的本系统平台服务或功能。本系统使用cookies可为您提供更加周到的服务，包括推广服务
        </TypoText>

        <TypoText level={3}>
          2.
          您有权选择接受或拒绝接受cookies。您可以通过修改浏览器设置的方式拒绝接受cookies。但如果您选择拒绝接受cookies，则您可能无法登录或使用依赖于cookies的本系统网络服务或功能
        </TypoText>

        <TypoText level={3}>
          3. 通过本系统所设cookies所取得的有关信息，将适用本政策
        </TypoText>

        <TypoText level={2}>四、我司如何共享、转让、公开披露您的信息</TypoText>

        <TypoText>
          在如下情况下，本系统将依据您的个人意愿或法律的规定全部或部分的披露您的个人信息：
        </TypoText>

        <TypoText level={3}>1. 经您事先同意，向第三方披露</TypoText>
        <TypoText level={3}>
          2. 为提供您所要求的产品和服务，而必须和第三方分享您的个人信息
        </TypoText>
        <TypoText level={3}>
          3.
          根据法律的有关规定，或者行政或司法机构的要求，向第三方或者行政、司法机构披露
        </TypoText>
        <TypoText level={3}>
          4.
          如您出现违反中国有关法律、法规或者本系统服务协议或相关规则的情况，需要向第三方披露
        </TypoText>
        <TypoText level={3}>
          5.
          如您是适格的知识产权投诉人并已提起投诉，应被投诉人要求，向被投诉人披露，以便双方处理可能的权利纠纷
        </TypoText>
        <TypoText level={3}>
          6.
          在本系统平台上创建的某一交易中，如交易任何一方履行或部分履行了交易义务并提出信息披露请求的，本系统有权决定向该用户提供其交易对方的联络方式等必要信息，以促成交易的完成或纠纷的解决
        </TypoText>
        <TypoText level={3}>
          7. 其它本系统根据法律、法规或者网站政策认为合适的披露
        </TypoText>

        <TypoText level={2}>五、我司如何保护、存储您的信息</TypoText>

        <TypoText>
          本系统收集的有关您的信息和资料将保存在本系统及（或）其关联公司的服务器上，这些信息和资料可能传送至您所在国家、地区或本系统收集信息和资料所在地的境外并在境外被访问、存储和展示。
        </TypoText>

        <TypoText>
          为保证向您提供本隐私政策目的所述的服务，我们可能会向第三方服务提供商与业务合作伙伴等第三方共享必要的个人信息。
        </TypoText>

        <TypoText>
          为了使您能够接收信息、在第三方平台分享信息、使用地图服务、播放视频等必要的功能用途，我们的应用中会嵌入授权合作伙伴的SDK或其他类似的应用程序。如您使用三星/vivo/oppo/华为/小米手机时，三星/vivo/oppo/华为/小米SDK需要读取您的设备识别号、联网相关信息，用于下发通知栏消息。
        </TypoText>

        <TypoText>
          我们会对授权合作伙伴获取有关信息的应用程序接口（API）、软件工具开发包（SDK）进行严格的安全检测，并与授权合作伙伴约定严格的数据保护措施，令其按照我们的委托目的、服务说明、本隐私权政策以及其他任何相关的保密和安全措施来处理个人信息。
        </TypoText>

        <TypoText>
          我们还会收集您的IMSI、IMEI、设备MAC地址、软件列表、设备序列号、Android
          ID用于判断您上次登录的方式，目的是方便您使用登录功能。
        </TypoText>

        <TypoText level={3}>本政策涉及的**个人信息或权限**包括：</TypoText>
        <TypoText>1. 账号密码信息</TypoText>
        <TypoText>2. 个人位置信息</TypoText>
        <TypoText>
          3.
          网络身份标识信息（包括系统账号、IP地址、邮箱地址及与前述有关的密码、密保）；通讯录
        </TypoText>
        <TypoText>
          4. 个人上网记录（包括搜索记录、软件使用记录、点击记录）
        </TypoText>
        <TypoText>
          5. 个人常用设备信息（包括硬件型号、**设备MAC地址**、操作系统类型）
        </TypoText>
        <TypoText>
          6. 软件列表唯一设备识别码（如**IMEI/android
          ID**/IDFA/OPENUDID/GUID、SIM卡**IMSI信息**等在内的描述个人常用设备基本情况的信息，存在收集ICCID、**Android
          ID、IP、IMSI、SD卡数据、IMEI、安装列表、设备序列号、传感器、MAC、获取传感器信息、监听传感器、获取设备传感器、加速度传感器、剪切板**的行为）
        </TypoText>

        <TypoText level={3}>第三方SDK列表：</TypoText>

        <TypoText level={4}>
          1. SDK名称：移动智能终端补充设备标识体系统一调用SDK
        </TypoText>
        <TypoText>包名：com.bun</TypoText>
        <TypoText>SDK厂家：中国信息通信研究院</TypoText>
        <TypoText>
          SDK描述：获取三星/vivo/oppo/华为/小米等设备厂商的补充设备标识（OAID、AAID等）
        </TypoText>
        <TypoText>个人信息：获取OAID</TypoText>

        <TypoText level={4}>2. SDK名称：支付宝小程序跳转；客户端SDK</TypoText>
        <TypoText>开发者:支付宝(杭州)信息技术有限公司</TypoText>
        <TypoText>作用：跳转支付宝小程序</TypoText>
        <TypoText>隐私政策链接：https://www.alipay.com/</TypoText>

        <TypoText level={4}>3. SDK名称：七牛云对象存储</TypoText>
        <TypoText>所涉信息：横幅展示</TypoText>
        <TypoText>用途：提供图片存储</TypoText>
        <TypoText>SDK名称：图片 SDK</TypoText>
        <TypoText>开发者:上海七牛信息技术有限公司</TypoText>
        <TypoText>
          隐私链接：https://www.qiniu.com/agreements/privacy-right
        </TypoText>

        <TypoText level={2}>六、如何访问和管理自己的信息、信息安全</TypoText>

        <TypoText level={3}>1. 本地数据信息安全</TypoText>
        <TypoText>
          您保存在本地的数据信息需保持应用账号登录状态方可查看与使用，若您不再继续在某设备继续使用本应用，请前往"其他"点击退出按钮以退出登录，以确保信息不被泄露。建议您在退出账号后将应用数据与缓存一并清除，必要时可将应用卸载，或将设备硬盘执行标准格式化。
        </TypoText>

        <TypoText level={3}>2. 服务器数据安全</TypoText>
        <TypoText>
          我们致力于保护您的个人信息的安全。为了防止未经授权的访问、披露或其他类似风险，我们落实了所有法律规定的物理、电子和管理措施流程，以保障我们从您的移动设备和小米网站上收集的信息的安全。我们将确保依据适用的法律保护您的个人信息。您的在使用过程中产生的临时信息（如暂存的课程数据）全都被储存在安全的服务器上，并在受控设施中受到保护。我们依据重要性和敏感性对您的信息进行分类，并且保证您的个人信息具有相应的安全等级。同样，我们对以云为基础的数据存储设有专门的访问控制措施，我们定期审查信息收集、储存和处理实践，包括物理安全措施，以防止任何未经授权的访问和使用。
        </TypoText>

        <TypoText level={3}>3. 服务器数据与个人信息的关联</TypoText>
        <TypoText>我们不会主动收集您的个人信息并与之相关联。</TypoText>

        <TypoText level={3}>4. 账号注销</TypoText>
        <TypoText>
          您可以通过点击"其他"——"注销"，输入登录密码，进行注销账号操作。账号注销后，我们将对已经收集的个人信息进行删除或匿名化处理。
        </TypoText>

        <TypoText level={3}>5. 您能做什么？</TypoText>
        <TypoText>
          您可以通过不向任何人（除非此人经您正式授权）披露您的登录密码或账号信息，您可以为账号设置唯一的密码，以防止其他网站密码泄露危害您在华师匣子的账号安全。无论何时，请不要向任何人透露您收到的验证码。无论您以校园账号用户的身份登录有关服务，尤其是在他人的计算机或公共互联网终端上登录时，您应当在会话结束后注销登出。华师匣子、木犀团队不对因您未能保持个人信息的私密性而导致第三方访问您的个人信息进而造成的安全疏漏承担责任。尽管有上述规定，如果发生其他任何互联网用户未经授权使用您账号的情况或其他任何安全漏洞，您应当立即通知我们。您的协助将有助于我们保护您个人信息的私密性。
        </TypoText>

        <TypoText level={2}>七、其他</TypoText>

        <TypoText level={3}>
          1. 本隐私政策的签订、生效、履行、争议的解决均适用中华人民共和国法律
        </TypoText>
        <TypoText level={3}>
          2.
          有关本协议的争议应通过友好协商解决，如果协商不成，该争议将提交公司所在地有管辖权的法院诉讼解决
        </TypoText>

        <TypoText level={3}>3. 联系我们</TypoText>
        <TypoText>
          如果您对本隐私政策有任何意见或问题，或者您对我们收集、使用或披露您的个人信息有任何问题，请通过发送邮件至官方邮箱(muxistudio@qq.com)联系我们。当我们收到有关您个人信息相关的权利请求、问题咨询等时，我们有专业的团队解决您的问题。如果您的问题本身涉及比较重大的事项，我们可能会要求您提供更多信息。如果您对收到的答复不满意，您可以将投诉移交给所在司法辖区的相关监管机构。如果您咨询我们，我们会根据您的实际情况，提供可能适用的相关投诉途径的信息。
        </TypoText>

        <TypoText>
          如果您对隐私政策有任何疑问或建议，请联系我们：电子邮箱：muxistudio@qq.com
        </TypoText>

        <TypoText style={styles.lastUpdated}>
          最后更新时间：2025年9月5日
        </TypoText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
  },
  metaInfo: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 18,
    marginBottom: 16,
  },
  lastUpdated: {
    marginTop: 24,
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});
