var keys_markup = "", baseUrl = '${baseUrl}'.replace('scripts/', '');
var resp = api.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
    "command": "wget " + baseUrl + "/installer/reconfigure.sh -O /var/www/webroot/reconfigure.sh; bash /var/www/webroot/reconfigure.sh"
}]), true);
if (resp.result != 0) return resp;
var infraFlavorList = getJsonFromFile("infraFlavors.json");
var infraFlavorListPrepared = prepareFlavorsList(JSON.parse(infraFlavorList));
var storagePoliciesList = getJsonFromFile("storagePolicies.json");
var storagePoliciesListPrepared = prepareStoragePoliciesList(JSON.parse(storagePoliciesList));
var userFlavorList = getJsonFromFile("userFlavors.json");
var userFlavorListPrepared = prepareFlavorsList(JSON.parse(userFlavorList));
var imagesList = getJsonFromFile("images.json");
var imageListPrepared = prepareImageList(JSON.parse(imagesList));
var subnetsList = getJsonFromFile("subnets.json");
var subnetListPrepared = prepareSubnetList(JSON.parse(subnetsList));
var sshKeys = getSSHKeysList();
var sshKeysPrepared = prepareSSHKeysList(JSON.parse(sshKeys));
var vapStackName = api.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
    command: '[ -f /var/www/webroot/.vapenv ] && source /var/www/webroot/.vapenv; echo $VAP_STACK_NAME'
}]), true).responses[0].out;
var currentSSHKey = api.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
    command: '[ -f /var/www/webroot/.vapenv ] && source /var/www/webroot/.vapenv; echo $VAP_SSH_KEY_NAME'
}]), true).responses[0].out;

function getJsonFromFile(jsonFile) {
    var cmd = "cat /var/www/webroot/" + jsonFile;
    var resp = api.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
        "command": cmd
    }]), true);
    if (resp.result != 0) throw resp;
    return resp.responses[0].out;
}

function getSSHKeysList() {
    var cmd = "source /var/www/webroot/.vapenv; /opt/jelastic-python311/bin/openstack keypair list -f json"
    var resp = api.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
        "command": cmd
    }]), true);
    if (resp.result != 0) {
        keys_markup = "Cannot get SSH keys list. Please perform the configuration step one more time with valid credentials.";
        api.marketplace.console.WriteLog(keys_markup);
        return "{}";
    } else {
        return resp.responses[0].out;
    }
}

function prepareSSHKeysList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].Name,
            value: values[i].Name
        });
    }
    return aResultValues;
}

function prepareFlavorsList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].RAM + " Mb " + values[i].VCPUs + " VCPUs ",
            value: values[i].id
        });
    }
    return aResultValues;
}

function prepareSubnetList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].Subnet,
            value: values[i].id
        });
    }
    return aResultValues;
}

function prepareStoragePoliciesList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].Name,
            value: values[i].id
        });
    }
    return aResultValues;
}

function prepareImageList(values) {
    var aResultValues = [];
    values = values || [];
    for (var i = 0, n = values.length; i < n; i++) {
        aResultValues.push({
            caption: values[i].Name,
            value: values[i].id
        });
    }
    return aResultValues;
}

var settings = jps.settings.create;
var fields = {};
for (let field of jps.settings.create.fields)
  fields[field.name] = field;
var instTypeFields = fields["inst_type"].showIf;
instTypeFields.poc[1].values = infraFlavorListPrepared;
instTypeFields.poc[1].tooltip.text = "<h2>PoC Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='" + baseUrl + "images/poc-requirements-w-uploader-docker.svg'>";
instTypeFields.poc[2].values = userFlavorListPrepared;
instTypeFields.poc[2].tooltip.text = "<h2>PoC Installation Type</h2>Make sure the Flavor meets the requirements for <b>User</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='" + baseUrl + "images/poc-requirements-w-uploader-docker.svg'>";
instTypeFields.sb[1].values = infraFlavorListPrepared;
instTypeFields.sb[1].tooltip.text = "<h2>Sandbox Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='" + baseUrl + "images/sandbox-requirements-w-uploader-docker.svg'>";
instTypeFields.sb[2].values = userFlavorListPrepared;
instTypeFields.sb[2].tooltip.text = "<h2>Sandbox Installation Type</h2>Make sure the Flavor meets the requirements for <b>User</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='" + baseUrl + "images/sandbox-requirements-w-uploader-docker.svg'>";
instTypeFields.prod[1].values = infraFlavorListPrepared;
instTypeFields.prod[1].tooltip.text = "<h2>Production Installation Type</h2>Make sure the Flavor meets the requirements for <b>Infra</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='" + baseUrl + "images/performance-requirements-w-uploader-docker.svg'>";
instTypeFields.prod[2].values = userFlavorListPrepared;
instTypeFields.prod[2].tooltip.text = "<h2>Production Installation Type</h2>Make sure the Flavor meets the requirements for <b>User</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='" + baseUrl + "images/performance-requirements-w-uploader-docker.svg'>";
instTypeFields.high_prod[1].values = infraFlavorListPrepared;
instTypeFields.high_prod[1].tooltip.text = "<h2>High Performance Production Installation Type</h2>Make sure the Flavor meets the requirements for <b>User</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='" + baseUrl + "images/high-performance-requirements-w-uploader-docker.svg'>";
instTypeFields.high_prod[2].values = userFlavorListPrepared;
instTypeFields.high_prod[2].tooltip.text = "<h2>High Performance Production Installation Type</h2>Make sure the Flavor meets the requirements for <b>User</b> nodes. <a href='https://www.virtuozzo.com/application-platform-ops-docs/hardware-requirements-local-storage/' target='_blank'>Learn More</a><p></p> <img width='600' height='250' src='" + baseUrl + "images/high-performance-requirements-w-uploader-docker.svg'>";
fields["vap_stack_name"].value = vapStackName;
fields["subnet"].values = subnetListPrepared;
fields["image_name"].values = imageListPrepared;
fields["ssh_key"].values = sshKeysPrepared;
fields["ssh_key"].default = currentSSHKey;

settings.fields.push({
    "caption": "Storage Policy Root",
    "type": "list",
    "tooltip": {
      "text": "A storage policy is a group of parameters that define how to store VM volumes: a tier, a failure domain, and a redundancy mode. A storage policy can also be used to limit the bandwidth or IOPS of the volume.\nYou may check storage policy details with VHI cluster admin. <a href='https://docs.virtuozzo.com/virtuozzo_hybrid_infrastructure_5_0_admins_guide/index.html#managing-storage-policies.html' target='_blank'>Learn More</a><p></p>\n"
    },
    "name": "root_storage_policy",
    "required": true,
    "values": storagePoliciesListPrepared
  });

settings.fields.push(
  {
    "type": "compositefield",
    "caption": "Storage Policy: Infra\n",
    "defaultMargins": "6 10 0 0",
    "tooltip": {
      "text": "A storage policy is a group of parameters that define how to store VM volumes: a tier, a failure domain, and a redundancy mode. A storage policy can also be used to limit the bandwidth or IOPS of the volume.\nYou may check storage policy details with VHI cluster admin. <a href='https://docs.virtuozzo.com/virtuozzo_hybrid_infrastructure_5_0_admins_guide/index.html#managing-storage-policies.html' target='_blank'>Learn More</a><p></p>\n"
    },
    "items": [
      {
        "name": "infra_storage_policy",
        "type": "list",
        "required": true,
        "width": 157,
        "values": storagePoliciesListPrepared
      },
      {
        "type": "displayfield",
        "markup": "User"
      },
      {
        "type": "tooltip",
        "text": "A storage policy is a group of parameters that define how to store VM volumes: a tier, a failure domain, and a redundancy mode. A storage policy can also be used to limit the bandwidth or IOPS of the volume.\nYou may check storage policy details with VHI cluster admin. <a href='https://docs.virtuozzo.com/virtuozzo_hybrid_infrastructure_5_0_admins_guide/index.html#managing-storage-policies.html' target='_blank'>Learn More</a><p></p>\n"
      },
      {
        "name": "user_storage_policy",
        "type": "list",
        "width": 157,
        "required": true,
        "values": storagePoliciesListPrepared
      }
    ]
  },
  {
     "name": "vap_platform_data_storage_policy",
     "caption": "Storage Policy: VAP Platform Data",
     "type": "list",
     "required": true,
     "values": storagePoliciesListPrepared,
     "tooltip": {
       "text": "A storage policy is a group of parameters that define how to store VM volumes: a tier, a failure domain, and a redundancy mode. A storage policy can also be used to limit the bandwidth or IOPS of the volume.\nYou may check storage policy details with VHI cluster admin. <a href='https://docs.virtuozzo.com/virtuozzo_hybrid_infrastructure_5_0_admins_guide/index.html#managing-storage-policies.html' target='_blank'>Learn More</a><p></p>\n"
     },
  }
);

if (keys_markup) {
    settings.fields.push(
        {"type": "displayfield", "cls": "warning", "height": 30, "hideLabel": true, "markup": keys_markup}
    )
}

return settings;
