var infraFlavorList = getJsonFromFile("infraFlavors.json");
var infraFlavorListPrepared = prepareFlavorsList(JSON.parse(infraFlavorList));
var storagePoliciesList = getJsonFromFile("volumeTypes.json");
var storagePoliciesListPrepared = prepareStoragePoliciesList(JSON.parse(storagePoliciesList));
var userFlavorList = getJsonFromFile("userFlavors.json");
var userFlavorListPrepared = prepareFlavorsList(JSON.parse(userFlavorList));
var imagesList = getJsonFromFile("images.json");
var imageListPrepared = prepareImageList(JSON.parse(imagesList));
var subnetsList = getJsonFromFile("subnets.json");
var subnetListPrepared = prepareSubnetList(JSON.parse(subnetsList));
var sshKeys = getSSHKeysList();
var sshKeysPrepared = prepareSSHKeysList(JSON.parse(sshKeys));
var vapStackName = jelastic.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
    command: 'source .vapenv && echo $VAP_STACK_NAME'
}]), true).responses[0].out;
var currentSSHKey = jelastic.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
    command: 'source .vapenv && echo $VAP_SSH_KEY_NAME'
}]), true).responses[0].out;

function getJsonFromFile(jsonFile) {
    var cmd = "cat /var/www/webroot/" + jsonFile;
    var resp = jelastic.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
        "command": cmd
    }]), true);
    if (resp.result != 0) return resp;
    return resp.responses[0].out;
}

function getSSHKeysList() {
    var cmd = "source .vapenv; /opt/jelastic-python311/bin/openstack keypair list -f json"
    var resp = jelastic.env.control.ExecCmdById('${env.envName}', session, '${nodes.cp.master.id}', toJSON([{
        "command": cmd
    }]), true);
    if (resp.result != 0) return resp;
    return resp.responses[0].out;
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
for (var i = 0, field; field = jps.settings.create.fields[i]; i++)
fields[field.name] = field;
var instTypeFields = fields["inst_type"].showIf;
instTypeFields.poc[0].values = infraFlavorListPrepared;
instTypeFields.poc[1].values = userFlavorListPrepared;
instTypeFields.sb[0].values = infraFlavorListPrepared;
instTypeFields.sb[1].values = userFlavorListPrepared;
instTypeFields.prod[0].values = infraFlavorListPrepared;
instTypeFields.prod[1].values = userFlavorListPrepared;
instTypeFields.high_prod[0].values = infraFlavorListPrepared;
instTypeFields.high_prod[1].values = userFlavorListPrepared;
fields["vap_stack_name"].value = vapStackName;
fields["ssh_key"].values = sshKeysPrepared;
fields["ssh_key"].
default = currentSSHKey;

settings.fields.push({
    "type": "compositefield",
    "caption": "Storage Policies",
    "defaultMargins": "0 12 0 0",
    "tooltip": {
        "text": "Storage policies for '<b>root</b>', '<b>infra</b>' and '<b>user</b>' nodes.<br>\n",
        "minWidth": 370
    },
    "items": [{
        "type": "list",
        "name": "root_storage_policy",
        "values": storagePoliciesListPrepared,
        "width": 109
    }, {
        "type": "displayfield",
        "markup": "/",
        "cls": "x-form-item-label",
        "width": 10
    }, {
        "type": "list",
        "name": "infra_storage_policy",
        "values": storagePoliciesListPrepared,
        "width": 108
    }, {
        "type": "displayfield",
        "markup": "/",
        "cls": "x-form-item-label",
        "width": 10
    }, {
        "type": "list",
        "name": "user_storage_policy",
        "values": storagePoliciesListPrepared,
        "width": 109
    }]
});

settings.fields.push({
    "caption": "User Node Count",
    "type": "spinner",
    "tooltip": {
        "text": "User Node Count to be created on the IaaS where the Infra nodes are.",
        "minWidth": 135
    },
    "name": "user_node_count",
    "default": 1,
    "min": 0,
    "max": 5
});

settings.fields.push({
    "caption": "VHI Public Subnet",
    "type": "list",
    "tooltip": {
        "text": "Select required VHI cluster subnet",
        "minWidth": 240
    },
    "name": "subnet",
    "required": true,
    "values": "subnetListPrepared"
});

settings.fields.push({
    "caption": "VAP Image Name",
    "type": "list",
    "tooltip": {
        "text": "Select required <b>qcow2</b> VAP image name",
        "minWidth": 270
    },
    "name": "image_name",
    "required": true,
    "values": "imageListPrepared"
});

return settings;
