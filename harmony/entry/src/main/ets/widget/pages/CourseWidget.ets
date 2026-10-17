const courseWidgetStorage = new LocalStorage();

@Entry(courseWidgetStorage)
@Component
struct CourseWidget {
  @LocalStorageProp('title') title: string = '本週課程';
  @LocalStorageProp('emptyMessage') emptyMessage: string = '尚未同步課表';
  @LocalStorageProp('course1') course1: string = '';
  @LocalStorageProp('course2') course2: string = '';
  @LocalStorageProp('course3') course3: string = '';
  @LocalStorageProp('course4') course4: string = '';
  @LocalStorageProp('course5') course5: string = '';
  @LocalStorageProp('course6') course6: string = '';
  @LocalStorageProp('isWide') isWide: boolean = false;

  build() {
    FormLink({ action: 'router', abilityName: 'EntryAbility' }) {
      Column({ space: 7 }) {
        Text(this.title)
          .fontSize(17)
          .fontWeight(FontWeight.Bold)
          .fontColor('#312E81')
          .width('100%')

        if (this.emptyMessage.length > 0) {
          Text(this.emptyMessage)
            .fontSize(14)
            .fontColor('#6B7280')
            .width('100%')
        }
        if (this.isWide) {
          Flex({ wrap: FlexWrap.Wrap }) {
            if (this.course1.length > 0) {
              this.CourseRow(this.course1, true)
            }
            if (this.course2.length > 0) {
              this.CourseRow(this.course2, true)
            }
            if (this.course3.length > 0) {
              this.CourseRow(this.course3, true)
            }
            if (this.course4.length > 0) {
              this.CourseRow(this.course4, true)
            }
            if (this.course5.length > 0) {
              this.CourseRow(this.course5, true)
            }
            if (this.course6.length > 0) {
              this.CourseRow(this.course6, true)
            }
          }
          .width('100%')
        } else {
          if (this.course1.length > 0) {
            this.CourseRow(this.course1, false)
          }
          if (this.course2.length > 0) {
            this.CourseRow(this.course2, false)
          }
          if (this.course3.length > 0) {
            this.CourseRow(this.course3, false)
          }
        }
      }
      .alignItems(HorizontalAlign.Start)
      .backgroundColor('#F5F3FF')
      .borderRadius(18)
      .height('100%')
      .padding(16)
      .width('100%')
    }
  }

  @Builder
  CourseRow(content: string, isWide: boolean) {
    Text(content)
      .fontSize(13)
      .fontColor('#1F2937')
      .maxLines(1)
      .textOverflow({ overflow: TextOverflow.Ellipsis })
      .width(isWide ? '50%' : '100%')
  }
}
