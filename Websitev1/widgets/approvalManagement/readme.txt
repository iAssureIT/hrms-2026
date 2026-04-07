submit form --status initially- Pending
master app level -role 


updateStatus=(status)=>{
    formvalues={
        _id:params
        applevel:
        appauthname
        appauthrole
        status:selectedStatus,
        remark:remark?remark:"",
        user_id
    }
patch("/api/xyx/patch/status",formvalues)
table refresh 

on this view page
list icon edit icon  date format

status = Approved ? appr image 
status = Rejected ? rej image 
status = Pending ? pend image 

table should come from Approval level master
level     autherole     time          status     remark
"level-1" "autherole"                 Pending
"level-2" "autherole"    time         Approved
"level-1" "autherole"    time         rejected   remark
"level-1" "autherole"                 Pending

------------------------------------------------------
patch("/api/xyx/patch/status")


approval doc status -- pending
approval doc status -- rejected

all level -approved---approved 

